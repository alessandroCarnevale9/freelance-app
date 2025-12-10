const User = require("../models/UserModel");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const ethers = require("ethers");
const { Readable } = require("stream");

const {
  generateAccessToken,
  generateRefreshToken,
  attachRefreshTokenCookie,
  verifyRefreshToken,
  clearRefreshTokenCookie,
} = require("../services/tokenService");

let released_nonce = [];

// *** login with metamask ***
const metamaskLogin = async (req, res) => {

  const { address, nickname, signedMessage, nonce } = req.body;

  // Validazione campi richiesti
  if (!address || /*!nickname ||*/ !signedMessage || !nonce) {
    throw new ApiError(400, "Tutti i campi sono obbligatori");
  }

  // Verifica nonce valido
  if (released_nonce.includes(nonce)) {
    released_nonce = released_nonce.filter((n) => n !== nonce);
  } else {
    throw new ApiError(401, "Nonce non valido o scaduto");
  }

  // Verifica firma
  const recoveredAddress = ethers.utils.verifyMessage(nonce, signedMessage);

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new ApiError(401, "Verifica firma fallita");
  }

  // Cerca utente per address
  const foundUser = await User.findOne({
    address: address.toLowerCase().trim(),
  }).exec();

  if (!foundUser) {
    throw new ApiError(
      404,
      "Utente non trovato. Registrati prima di effettuare il login."
    );
  }

  if (!foundUser.isActive) {
    throw new ApiError(401, "Account disattivato");
  }

  // Verifica nickname
  // if (foundUser.nickname !== nickname) {
  //   throw new ApiError(401, "Nickname non corrispondente");
  // }

  // Genera tokens
  const payload = {
    UserInfo: {
      id: foundUser._id.toString(),
      address: foundUser.address,
      role: foundUser.role,
    },
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  attachRefreshTokenCookie(res, refreshToken);

  const returnUser = {
    user: {
      address: foundUser.address,
      nickname: foundUser.nickname,
      role: foundUser.role,
    },
  };

  res.status(200).json({ returnUser, accessToken });
};

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) throw new ApiError(404, "All fields are required");

//   const foundUser = await User.findOne({ email }).exec();

//   if (!foundUser || !foundUser.isActive)
//     throw new ApiError(401, "Unauthorized");

//   const match = await bcrypt.compare(password, foundUser.password);
//   if (!match) throw new ApiError(401, "Unauthorized");

//   const payload = {
//     UserInfo: {
//       id: foundUser._id.toString(),
//       email: foundUser.email,
//       role: foundUser.role,
//     },
//   };

//   const accessToken = generateAccessToken(payload);
//   const refreshToken = generateRefreshToken(payload);
//   attachRefreshTokenCookie(res, refreshToken);

//   res.status(201).json({ accessToken });
// };

const refresh = async (req, res) => {
  const token = req.cookies?.jwt;
  if (!token) throw new ApiError(401, "Unauthorized");

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    clearRefreshTokenCookie(res);
    throw new ApiError(403, "Forbidden");
  }

  const foundUser = await User.findById(decoded.UserInfo.id).exec();
  if (!foundUser) {
    clearRefreshTokenCookie(res);
    throw new ApiError(401, "Unauthorized");
  }

  const payload = {
    UserInfo: {
      id: foundUser._id.toString(),
      email: foundUser.email,
      role: foundUser.role,
    },
  };

  const accessToken = generateAccessToken(payload);
  attachRefreshTokenCookie(res, token);

  res.status(201).json({ accessToken });
};

const logout = async (req, res) => {
  if (!req.cookies?.jwt) return res.sendStatus(204);

  clearRefreshTokenCookie(res);
  res.sendStatus(204);
};

// signup with metamask
const nonce = async (req, res) => {
  const nonce = crypto.randomBytes(32).toString("hex");
  released_nonce.push(nonce);
  res.json({ nonce });
};

const uploadFile = (bucket, files, customId) => {
  return Promise.all(
    files.map((file, index) => {
      return new Promise((resolve, reject) => {
        const uniqueId = `${customId}_${index}`;

        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        const uploadStream = bucket.openUploadStream(file.originalname, {
          id: uniqueId,
          metadata: {
            contentType: file.mimetype,
          },
        });

        readableStream.pipe(uploadStream);

        uploadStream.on("error", (err) => {
          console.log("Errore upload file:", err);
          reject(err);
        });
        uploadStream.on("finish", () => {
          resolve({
            id: uniqueId,
          });
        });
      });
    })
  );
};

const metamaskSignup = async (req, res) => {
  const { address, nickname, role, signedMessage, nonce } = req.body;

  if (released_nonce.includes(nonce)) {
    released_nonce = released_nonce.filter((n) => n !== nonce);
  } else {
    throw new ApiError(401, "Nonce non valido o scaduto");
  }

  const recoveredAddress = ethers.utils.verifyMessage(nonce, signedMessage);

  if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
    throw new ApiError(401, "Signature verification failed");
  }

  const existing = await User.findOne({
    address: address.toLowerCase().trim(),
  }).exec();

  if (existing)
    throw new ApiError(409, `User with address ${address} already exists.`);

  try {
    const newUser = await User.create({
      address: address.toLowerCase().trim(),
      nickname,
      role: role ? role.toUpperCase() : undefined,
      isActive: true,
    });

    const payload = {
      UserInfo: {
        id: newUser._id.toString(),
        address: newUser.address,
        role: newUser.role,
      },
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    attachRefreshTokenCookie(res, refreshToken);

    const returnUser = {
      user: {
        address: newUser.address,
        nickname: newUser.nickname,
        role: newUser.role,
      },
    };

    res.status(201).json({ returnUser, accessToken });
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const freelancerSignup = (bucket) => {
  return async (req, res) => {
    if (!req.body.data) throw new Error("Missing form data");
    const formData = JSON.parse(req.body.data);

    const {
      address,
      nickname,
      title,
      role,
      signedMessage,
      skills,
      projects,
      nonce,
    } = formData;

    if (released_nonce.includes(nonce)) {
      released_nonce = released_nonce.filter((n) => n !== nonce);
    } else {
      throw new ApiError(401, "Nonce non valido o scaduto");
    }

    const files = req.files;

    if (!title) {
      return res.status(400).json({
        error: "Titolo mancante",
      });
    }

    if (!address) {
      return res.status(400).json({
        error: "Indirizzo mancante",
      });
    }

    if (!role) {
      return res.status(400).json({
        error: "Ruolo mancante",
      });
    }

    if (!signedMessage) {
      return res.status(400).json({
        error: "Firma mancante",
      });
    }

    if (!nickname) {
      return res.status(400).json({
        error: "Nome mancante",
      });
    }

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        error: "Competenze mancanti",
      });
    }

    if (!bucket) {
      return res.status(500).json({
        error: "Database non pronto",
      });
    }

    const recoveredAddress = ethers.utils.verifyMessage(nonce, signedMessage);

    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      throw new ApiError(401, "Signature verification failed");
    }

    let uploadedFileIds = [];

    try {
      const existingUser = await User.exists({
        address: recoveredAddress.toLowerCase().trim(),
      });

      if (existingUser) {
        return res
          .status(409)
          .json({
            error: `Utente con indirizzo ${recoveredAddress} già esistente.`,
          });
      }

      const processedProjects = [];

      for (const [index, project] of projects.entries()) {
        const projectFiles = files.filter(
          (f) => f.fieldname === `${recoveredAddress}_project_${index}`
        );

        let imageIds = [];
        if (projectFiles.length > 0) {
          imageIds = await uploadFile(
            bucket,
            projectFiles,
            `${recoveredAddress}_project_${index}`
          );

          imageIds = imageIds.map((img) => img.id);
          uploadedFileIds.push(...imageIds);
        }

        processedProjects.push({
          title: project.title,
          description: project.description,
          imageIds: imageIds,
        });
      }

      const newUserCreation =
        processedProjects.length !== 0
          ? async () => {
              return await User.create({
                address: recoveredAddress.toLowerCase().trim(),
                nickname,
                role,
                skills,
                projects: processedProjects,
                isActive: true,
              });
            }
          : async () => {
              return await User.create({
                address: recoveredAddress.toLowerCase().trim(),
                nickname,
                role,
                skills,
                isActive: true,
              });
            };

      const newUser = await newUserCreation();

      console.log("newUser:", newUser);

      const payload = {
        UserInfo: {
          id: newUser._id.toString(),
          address: newUser.address,
          role: newUser.role,
        },
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      attachRefreshTokenCookie(res, refreshToken);

      const returnUser = {
        user: {
          address: newUser.address,
          nickname: newUser.nickname,
          role: newUser.role,
        },
      };

      res.status(201).json({ returnUser, accessToken });
    } catch (err) {
      console.error("Errore:", err);

      if (uploadedFileIds.length > 0) {
        console.log("uploading rollback, deleting files:", uploadedFileIds);
        uploadedFileIds.forEach((id) => bucket.delete(id));
      }

      res.status(500).json({ error: err.message });
    }
  };
};

module.exports = {
  // login,
  metamaskLogin,
  refresh,
  logout,
  nonce,
  metamaskSignup,
  freelancerSignup,
};
