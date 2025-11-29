const User = require('../models/UserModel')
const ApiError = require('../utils/ApiError')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const ethers = require('ethers');
const {Readable} = require('stream');

const {
    generateAccessToken,
    generateRefreshToken,
    attachRefreshTokenCookie,
    verifyRefreshToken,
    clearRefreshTokenCookie
} = require('../services/tokenService')

// login user
const login = async (req, res) => {
    const { email, password } = req.body

    if(!email || !password)
        throw new ApiError(404, 'All fields are required')

    const foundUser = await User.findOne({ email }).exec()

    if(!foundUser || !foundUser.isActive)
        throw new ApiError(401, 'Unauthorized')

    const match = await bcrypt.compare(password, foundUser.password)
    if(!match)
        throw new ApiError(401, 'Unauthorized')

    const payload = {
        UserInfo: {
            id: foundUser._id.toString(),
            email: foundUser.email,
            role: foundUser.role
        }
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    attachRefreshTokenCookie(res, refreshToken)

    res.status(201).json({ accessToken })
}

const refresh = async (req, res) => {
    const token = req.cookies?.jwt
    if(!token)
        throw new ApiError(401, 'Unauthorized')

    let decoded
    try {
        decoded = verifyRefreshToken(token)
    } catch (err) {
        clearRefreshTokenCookie(res)
        throw new ApiError(403, 'Forbidden')
    }

    const foundUser = await User.findById(decoded.UserInfo.id).exec()
    if(!foundUser) {
        clearRefreshTokenCookie(res)
        throw new ApiError(401, 'Unauthorized')
    }

    const payload = {
        UserInfo: {
            id: foundUser._id.toString(),
            email: foundUser.email,
            role: foundUser.role
        }
    }

    const accessToken = generateAccessToken(payload)
    attachRefreshTokenCookie(res, token)

    res.status(201).json({ accessToken })
}

const logout = async (req, res) => {
    if(!req.cookies?.jwt)
        return res.sendStatus(204)

    clearRefreshTokenCookie(res)
    res.sendStatus(204)
}

// login w metamask
const nonce = async (req, res) => {
    const nonce = crypto.randomBytes(32).toString('hex');

    res.json({ nonce });
}

const uploadFile = (bucket, files, customId) => {
  return Promise.all(files.map((file, index) => {
    return new Promise((resolve, reject) => {

      const uniqueId = `${customId}_${index}`;

      const readableStream = new Readable();
      readableStream.push(file.buffer);
      readableStream.push(null);

      // Apriamo lo stream verso GridFS
      const uploadStream = bucket.openUploadStream(file.originalname, {
        id: uniqueId,
        metadata: {
          contentType: file.mimetype
        }
      });

      // Pipe dei dati
      readableStream.pipe(uploadStream);

      uploadStream.on('error', (err) => {
        console.log('Errore upload file:', err);
        reject(err);
      });
      uploadStream.on('finish', () => {
        resolve({
          id: uniqueId
        });
      });
    });
  }));
}

const metamaskSignup = async (req, res) => {

    const { address, nickname, role, signedMessage, message } = req.body

    const recovedeAddress = ethers.utils.verifyMessage(message, signedMessage);
    
    if (recovedeAddress.toLowerCase() !== address.toLowerCase()) {
        throw new ApiError(401, 'Signature verification failed');
    }

    const existing = await User.findOne({   address: address.toLowerCase().trim() }).exec()

    if(existing)
        throw new ApiError(409, `User with address ${address} already exists.`)

    try {
        const user = await User.create({ address, nickname, role: role ? role.toUpperCase() : undefined, isActive: true })
        res.status(201).json({ user })
    } catch (error) {
        res.json({ error: error.message })
    }
}

const freelancerSignup = (bucket) => {
    return async (req, res) => {

    if(!req.body.data) throw new Error('Missing form data');
    const formData = JSON.parse(req.body.data);

    const { address, nickname, title, role, signedMessage, message, skills, projects } = formData

    const files = req.files;

    if(!title) {
      return res.status(400).json({
        error: 'Titolo mancante'
      });
    }

    if(!address) {
      return res.status(400).json({
        error: 'Indirizzo mancante'
      });
    }

    if (!role) {
      return res.status(400).json({
        error: 'Ruolo mancante'
      });
    }

    if (!message || !signedMessage) {
      return res.status(400).json({
        error: 'Messaggio o firma mancante'
      });
    }

    if (!nickname) {
      return res.status(400).json({
        error: 'Nome mancante'
      });
    }

    if (!title) {
      return res.status(400).json({
        error: 'Titolo mancante'
      });
    }

    if (!skills || skills.length === 0) {
      return res.status(400).json({
        error: 'Competenze mancanti'
      });
    }

    if (!files) {
      return res.status(400).json({
        error: 'Nessun file caricato'
      });
    }

    if (!bucket) {
      return res.status(500).json({
        error: 'Database non pronto'
      });
    }

    // const recovedeAddress = ethers.utils.verifyMessage(message, signedMessage);
    
    // if (recovedeAddress.toLowerCase() !== address.toLowerCase()) {
    //     throw new ApiError(401, 'Signature verification failed');
    // }

    // // --- STREAM MANUALE VERSO GRIDFS ---

    // // 1. Convertiamo il buffer (RAM) in uno stream leggibile
    // const readableStream = new Readable();
    // readableStream.push(req.file.buffer);
    // readableStream.push(null); // Indica la fine dello stream

    // // 2. Apriamo lo stream di upload verso Mongo
    // const uploadStream = bucket.openUploadStream(req.file.originalname, {
    //   id: customId, // <--- Assegnazione ID manuale qui (SICURA)
    //   metadata: {
    //     contentType: req.file.mimetype,
    //     size: req.file.size
    //   }
    // });

    // // 3. Colleghiamo (Pipe) lo stream di lettura a quello di scrittura
    // readableStream.pipe(uploadStream);

    // // 4. Gestione Eventi
    // uploadStream.on('error', (err) => {
    //   console.error(err);
    //   // Gestione specifica per chiave duplicata
    //   if (err.code === 11000) {
    //     return res.status(409).json({
    //       error: 'ID immagine già esistente!'
    //     });
    //   }
    //   return res.status(500).json({
    //     error: 'Errore durante il salvataggio'
    //   });
    // });

    // uploadStream.on('finish', () => {
    //   // Tutto andato a buon fine
    //   res.json({
    //     message: "Upload completato con successo",
    //     file: {
    //       id: uploadStream.id, // Questo è l'ID che hai passato tu
    //       filename: req.file.originalname
    //     }
    //   });
    // });

    const recovedeAddress = ethers.utils.verifyMessage(message, signedMessage);

    if (recovedeAddress.toLowerCase() !== address.toLowerCase()) {
        throw new ApiError(401, 'Signature verification failed');
    }

    let uploadedFileIds = []

    try {
      const existingUser = await User.exists({ address: recovedeAddress.toLowerCase().trim() });

      if (existingUser) {
        return res.status(409).json({ error: `Utente con indirizzo ${recovedeAddress} già esistente.` });
      }

      const processedProjects = []

      for (const [index, project] of projects.entries()) {
        const projectFiles = files.filter(f => f.fieldname === `${recovedeAddress}_project_${index}`);

        let imageIds = []
        if(projectFiles.length > 0) {
          imageIds = await uploadFile(bucket, projectFiles,  `${recovedeAddress}_project_${index}`)
          
          imageIds = imageIds.map(img => img.id);
          uploadedFileIds.push(...imageIds)
        }

        processedProjects.push({
          title: project.title,
          description: project.description,
          imageIds: imageIds
        })
      }

      const newUser = new User({
        address: recovedeAddress.toLowerCase().trim(),
        nickname,
        role,
        skills,
        projects: processedProjects
      })

      await newUser.save();
      res.status(201).json({ message: "Registrazione con progetti multipli completata!" });
    } catch (err) {
      console.error("Errore:", err);

      if(uploadedFileIds.length > 0) {
        console.log('uploading rollback, deleting files:', uploadedFileIds);
        uploadedFileIds.forEach(id => bucket.delete(id));
      }

      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = {
    login,
    refresh,
    logout,
    nonce,
    metamaskSignup,
    freelancerSignup
}
