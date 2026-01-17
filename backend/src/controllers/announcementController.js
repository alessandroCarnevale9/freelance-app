const Announcement = require('../models/AnnouncementModel');
const ApiError = require('../utils/ApiError');
const ethers = require("ethers");
const User = require('../models/UserModel');
const Work = require('../models/WorkModel');
const { Readable } = require("stream");
const dotenv = require("dotenv");

dotenv.config();

const addCandidate = async (req, res) => {
    const { candidateAddress, announcement } = req.body;

    try {
        await Announcement.create({ announcement, candidateAddress });
        res.status(201).json({ ok: true });
    } catch (err) {
        if (err.code === 11000) {
            throw new ApiError(409, "Candidatura già esistente per questo annuncio");
        }

        throw new ApiError(500, err.message);
    }
}

const deleteCandidate = async (req, res) => {
    const { candidateAddress, announcement } = req.body;

    const result = await Announcement.deleteOne({ announcement, candidateAddress });

    if (result.deletedCount === 0) {
        throw new ApiError(404, "Candidatura non trovata");
    }

    res.status(200).json({ ok: true });
}

const deleteAllCandidatesForAnnouncement = async (req, res) => {
    const { announcementId } = req.params;
    const result = await Announcement.deleteMany({ announcement: announcementId });
    res.status(200).json({ ok: true, deletedCount: result.deletedCount });
}

const getCandidatesByAnnouncement = async (req, res) => {
    const { announcementId } = req.params;

    const candidates = await Announcement.find({ announcement: announcementId }).exec();

    res.status(200).json(candidates);
}

const getRegistredAnnouncementsNumberForCandidate = async (req, res) => {
    const { candidateAddress } = req.params;

    try {
        const registredCandidations = await Announcement.find({ candidateAddress: candidateAddress.toLowerCase() }).lean().exec();
        const count = registredCandidations.length;

        return res.status(200).json(count);
    } catch (err) {
        throw new ApiError(500, err.message || String(err));
    }
}

const getAnnouncementsForCandidate = async (req, res) => {
    const { candidateAddress } = req.params;

    const registredCandidations = await Announcement.find({ candidateAddress: candidateAddress.toLowerCase() }).lean().exec();

    const query = `
        query {
          announcements(where: { status: "Open" }) {
            id
            client
            budget
            deadline
            dataHash
            createdAt
          }
        }
      `

    try {
        const result = await fetch(
            "http://localhost:8000/subgraphs/name/freelance-subgraph",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            }
        );

        if (!result.ok) throw new ApiError(500, `HTTP ${result.status}`);

        const json = await result.json();
        if (json.errors)
            throw new ApiError(500, json.errors.map((e) => e.message).join(", "));

        let data = json.data?.announcements || [];

        data = data.filter(a => {
            return !registredCandidations.find(c => String(c.announcement) === String(a.id));
        })

        try {
            const mapped = await Promise.all(
                data.map(async (a) => {
                    let title = `Annuncio #${a.id}`;
                    let description = "";
                    let requirements = [];
                    let skills = [];

                    if (a.dataHash) {
                        try {
                            const ipfsRes = await fetch(
                                `https://gateway.pinata.cloud/ipfs/${a.dataHash}`
                            );
                            if (ipfsRes.ok) {
                                const payload = await ipfsRes.json();
                                title = payload.title || title;
                                description = payload.description || "";
                                requirements = payload.requirements || [];
                                skills = payload.skills || [];
                            }
                        } catch (e) {
                            throw Error("IPFS read failed", e);
                        }
                    }

                    return {
                        id: a.id,
                        title,
                        skills,
                        summary: description,
                        deadline: new Date(Number(a.deadline) * 1000),
                        status: "Aperto",
                        budget: ethers.utils.formatEther(a.budget),
                        requirements,
                        createdAt: new Date(Number(a.createdAt) * 1000)
                    };
                })
            );

            res.status(200).json(mapped);
        } catch (e) {
            throw e;
        }
    } catch (e) {
        throw new ApiError(500, e);
    }
}

const getRegistredAnnouncementsForCandidate = async (req, res) => {
    const { candidateAddress } = req.params;

    const registredCandidations = await Announcement.find({ candidateAddress: candidateAddress.toLowerCase() }).lean().exec();

    const query = `
        query {
          announcements(where: { status: "Open" }) {
            id
            client
            budget
            deadline
            dataHash
            createdAt
          }
        }
      `

    try {
        const result = await fetch(
            "http://localhost:8000/subgraphs/name/freelance-subgraph",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            }
        );

        if (!result.ok) throw new ApiError(500, `HTTP ${result.status}`);

        const json = await result.json();
        if (json.errors)
            throw new ApiError(500, json.errors.map((e) => e.message).join(", "));

        let data = json.data?.announcements || [];

        data = data.filter(a => {
            return registredCandidations.find(c => String(c.announcement) === String(a.id));
        })

        try {
            const mapped = await Promise.all(
                data.map(async (a) => {
                    let title = `Annuncio #${a.id}`;
                    let description = "";
                    let requirements = [];
                    let skills = [];

                    if (a.dataHash) {
                        try {
                            const ipfsRes = await fetch(
                                `https://gateway.pinata.cloud/ipfs/${a.dataHash}`
                            );
                            if (ipfsRes.ok) {
                                const payload = await ipfsRes.json();
                                title = payload.title || title;
                                description = payload.description || "";
                                requirements = payload.requirements || [];
                                skills = payload.skills || [];
                            }
                        } catch (e) {
                            throw Error("IPFS read failed", e);
                        }
                    }

                    return {
                        id: a.id,
                        title,
                        skills,
                        summary: description,
                        deadline: new Date(Number(a.deadline) * 1000),
                        status: "Aperto",
                        budget: ethers.utils.formatEther(a.budget),
                        requirements,
                        createdAt: new Date(Number(a.createdAt) * 1000)
                    };
                })
            );

            res.status(200).json(mapped);
        } catch (e) {
            throw e;
        }
    } catch (e) {
        throw new ApiError(500, e);
    }
}

const getAnnouncementDetails = async (req, res) => {
    const { announcementId } = req.params;

    try {
        const announcements = await Announcement.find({ announcement: announcementId }).exec();
        const candidates = await User.find({ address: { $in: announcements.map(a => a.candidateAddress) } }).exec();

        const query = `
        query {
          announcements(where: { id: "${announcementId}" }) {
            id
            client
            budget
            deadline
            createdAt
            dataHash
            status
            freelancer
          }
        }
      `;

        const result = await fetch(
            "http://localhost:8000/subgraphs/name/freelance-subgraph",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            }
        );
        if (!result.ok) throw new Error(`HTTP ${result.status}`);
        const json = await result.json();
        if (json.errors)
            throw new Error(json.errors.map((e) => e.message).join(", "));
        const data = json.data?.announcements?.[0];
        if (!data) throw new Error("Annuncio non trovato");

        let meta = {};
        if (data.dataHash) {
            try {
                const ipfsRes = await fetch(
                    `https://gateway.pinata.cloud/ipfs/${data.dataHash}`
                );
                if (ipfsRes.ok) meta = await ipfsRes.json();
            } catch (e) {
                console.warn("IPFS read failed", e);
            }
        }

        const work = await Work.findOne({ announcementId: announcementId }).exec();
        let status = data.status;
        if (work && data.status == "InProgress") {
            status = "InProgress_Sent"
        }

        let freelancerOutput = null;
        const freelancerData = await User.findOne({ address: data.freelancer }).exec();
        if (freelancerData) {
            freelancerOutput = freelancerData
        }

        const announcementDetails = {
            id: data.id,
            client: meta.clientName || data.client || "—",
            title: meta.title || `Annuncio #${data.id}`,
            summary: meta.description || "",
            skills: meta.skills || [],
            requirements: meta.requirements || [],
            budget:
                data.budget != null
                    ? String(data.budget).includes(".")
                        ? data.budget
                        : ethers.utils.formatEther(data.budget)
                    : "—",
            deadline: data.deadline || null,
            createdAt: data.createdAt || null,
            status: status,
            freelancer: freelancerOutput,
            dataHash: data.dataHash
        }

        res.status(200).json({ announcement: announcementDetails, candidates, });
    } catch (err) {
        throw new ApiError(500, err);
    }

}

const getAnnouncementsForFreelancer = async (req, res) => {
    const { freelancerAddress } = req.params;

    const query = `
        query {
          announcements(where: { freelancer: "${freelancerAddress}" }) {
            id
            client
            budget
            deadline
            createdAt
            dataHash
            status
          }
        }
      `;

    try {
        const result = await fetch(
            "http://localhost:8000/subgraphs/name/freelance-subgraph",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            }
        )

        if (!result.ok) throw new Error(`HTTP ${result.status}`);

        const json = await result.json();
        if (json.errors)
            throw new Error(json.errors.map((e) => e.message).join(", "));

        const data = json.data?.announcements || [];

        try {
            const mapped = await Promise.all(
                data.map(async (a) => {
                    let title = `Annuncio #${a.id}`;
                    let description = "";
                    let requirements = [];
                    let skills = [];

                    if (a.dataHash) {
                        try {
                            const ipfsRes = await fetch(
                                `https://gateway.pinata.cloud/ipfs/${a.dataHash}`
                            );
                            if (ipfsRes.ok) {
                                const payload = await ipfsRes.json();
                                title = payload.title || title;
                                description = payload.description || "";
                                requirements = payload.requirements || [];
                                skills = payload.skills || [];
                            }
                        } catch (e) {
                            throw Error("IPFS read failed", e);
                        }
                    }

                    const work = await Work.findOne({ announcementId: a.id, }).exec();
                    let status = "InProgress"
                    if (work) {
                        status = "InProgress_Sent"
                    }
 
                    return {
                        id: a.id,
                        title,
                        skills,
                        summary: description,
                        deadline: new Date(Number(a.deadline) * 1000),
                        status: status,
                        budget: ethers.utils.formatEther(a.budget),
                        requirements,
                        createdAt: new Date(Number(a.createdAt) * 1000)
                    };
                })
            );

            res.status(200).json(mapped);
        } catch (e) {
            throw e;
        }
    } catch (err) {
        throw new ApiError(500, err.message || String(err));
    }
}

const getAnnouncementsForClient = async (req, res) => {
    const { clientAddress } = req.params;

    const query = `
        query {
          announcements(where: { client: "${clientAddress}" }) {
            id
            client
            budget
            deadline
            createdAt
            dataHash
            status
          }
        }
      `;

    try {
        const result = await fetch(
            "http://localhost:8000/subgraphs/name/freelance-subgraph",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            }
        )

        if (!result.ok) throw new Error(`HTTP ${result.status}`);

        const json = await result.json();
        if (json.errors)
            throw new Error(json.errors.map((e) => e.message).join(", "));

        const data = json.data?.announcements || [];

        try {
            const mapped = await Promise.all(
                data.map(async (a) => {
                    let title = `Annuncio #${a.id}`;
                    let description = "";
                    let requirements = [];
                    let skills = [];

                    if (a.dataHash) {
                        try {
                            const ipfsRes = await fetch(
                                `https://gateway.pinata.cloud/ipfs/${a.dataHash}`
                            );
                            if (ipfsRes.ok) {
                                const payload = await ipfsRes.json();
                                title = payload.title || title;
                                description = payload.description || "";
                                requirements = payload.requirements || [];
                                skills = payload.skills || [];
                            }
                        } catch (e) {
                            throw Error("IPFS read failed", e);
                        }
                    }

                    const work = await Work.findOne({ announcementId: a.id, }).exec();
                    let status = a.status
                    if (work && status === "InProgress") {
                        status = "InProgress_Sent"
                    }
 
                    return {
                        id: a.id,
                        title,
                        skills,
                        summary: description,
                        deadline: new Date(Number(a.deadline) * 1000),
                        status: status,
                        budget: ethers.utils.formatEther(a.budget),
                        requirements,
                        createdAt: new Date(Number(a.createdAt) * 1000)
                    };
                })
            );

            res.status(200).json(mapped);
        } catch (e) {
            throw e;
        }
    } catch (err) {
        throw new ApiError(500, err.message || String(err));
    }
}

const uploadProjectFileForAnnouncement = (bucket) => {
    return async (req, res) => {
        if (!req.body.data) throw new Error("Missing form data");
        const formData = JSON.parse(req.body.data);

        const { announcementId } = formData;

        if (!req.files || req.files.length === 0) {
            throw new ApiError(400, "Nessun file caricato");
        }

        const file = req.files[0];

        await new Promise((resolve, reject) => {
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);

            const uploadStream = bucket.openUploadStream(file.originalname, {
                id: file.originalname + "_" + Date.now(),
                metadata: {
                    contentType: file.mimetype,
                },
            });

            readableStream.pipe(uploadStream);

            uploadStream.on("error", (err) => {
                console.error("Stream Error:", err);
                reject(new ApiError(500, "Errore durante lo stream del file"));
            });

            uploadStream.on("finish", () => {
                resolve();
            });
        });

        try {
            await Work.create({
                announcementId,
                workFileId: file.originalname
            });
        } catch (dbErr) {
            console.error("DB Error, rolling back file:", dbErr);
            try {
                await bucket.delete(file.originalname);
            } catch (delErr) {
                console.error("Impossibile cancellare file orfano:", delErr);
            }

            throw new ApiError(500, "Errore durante la registrazione del file nel database");
        }

        res.status(201).json({ ok: true });
    }
}

const getUploadedProjectNameForAnnouncement = async (req, res) => {
    const { announcementId } = req.params;

    const work = await Work.findOne({ announcementId }).exec();

    if (!work) {
        throw new ApiError(404, "Nessun progetto caricato per questo annuncio");
    }

    res.status(200).json({ workFileId: work.workFileId });
}

const deleteProjectFileForAnnouncement = (bucket) => {
    return async (req, res) => {
    const { announcementId } = req.params;

    const work = await Work.findOne({ announcementId }).exec();

    const workCopy = work;

    if (!work) {
        throw new ApiError(404, "Nessun progetto caricato per questo annuncio");
    }

    await Work.deleteOne({ announcementId }).exec();

    try {
        await bucket.delete(work.workFileId);
        res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Impossibile cancellare il file dal bucket, rollback nel database:", err);
        try {
            await Work.create(workCopy);
        } catch (dbErr) {
            console.error("Rollback fallito, stato incoerente:", dbErr);
        }

        throw new ApiError(500, "Errore durante la cancellazione del file dal bucket");
    }
}
}

module.exports = {
    addCandidate,
    deleteCandidate,
    getCandidatesByAnnouncement,
    getAnnouncementsForCandidate,
    getRegistredAnnouncementsForCandidate,
    getRegistredAnnouncementsNumberForCandidate,
    getAnnouncementDetails,
    deleteAllCandidatesForAnnouncement,
    getAnnouncementsForFreelancer,
    uploadProjectFileForAnnouncement,
    getUploadedProjectNameForAnnouncement,
    deleteProjectFileForAnnouncement,
    getAnnouncementsForClient,
};