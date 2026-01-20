const User = require('../models/UserModel');
const ApiError = require('../utils/ApiError');
const { Readable } = require('stream');

// GET /api/user/profile/:address - Ottieni profilo di un utente
const getProfile = async (req, res) => {
    const { address } = req.params;

    if (!address) {
        throw new ApiError(400, 'Address richiesto');
    }

    const user = await User.findOne({
        address: address.toLowerCase().trim(),
        isActive: true
    }).exec();

    if (!user) {
        throw new ApiError(404, 'Profilo non trovato');
    }

    const profile = user.getPublicProfile();

    res.status(200).json(profile);
};

// PUT /api/user/profile - Aggiorna il proprio profilo
const updateProfile = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        throw new ApiError(401, 'Non autorizzato');
    }

    const {
        nickname,
        description,
        email,
        skills,
        projects,
        github,
        portfolio,
        discord,
        slack
    } = req.body;

    const user = await User.findById(userId).exec();

    if (!user) {
        throw new ApiError(404, 'Utente non trovato');
    }

    // Validazione nickname
    if (nickname !== undefined) {
        if (!nickname || nickname.trim().length < 2) {
            throw new ApiError(400, 'Il nickname deve essere di almeno 2 caratteri');
        }
        user.nickname = nickname.trim();
    }

    // Validazione email
    if (email !== undefined) {
        if (email && email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new ApiError(400, 'Email non valida');
            }
        }
        user.email = email.trim();
    }

    // Validazione URL
    const urlRegex = /^https?:\/\/.+/i;

    if (github !== undefined) {
        if (github && github.trim() !== '' && !urlRegex.test(github)) {
            throw new ApiError(400, 'URL GitHub non valido');
        }
        user.github = github.trim();
    }

    if (portfolio !== undefined) {
        if (portfolio && portfolio.trim() !== '' && !urlRegex.test(portfolio)) {
            throw new ApiError(400, 'URL Portfolio non valido');
        }
        user.portfolio = portfolio.trim();
    }

    // Campi specifici per Freelancer
    if (user.role === 'FREELANCER') {
        // Validazione skills
        if (skills !== undefined) {
            if (!Array.isArray(skills) || skills.length === 0) {
                throw new ApiError(400, 'I freelancer devono avere almeno una skill');
            }
            user.skills = skills.map(s => s.trim()).filter(Boolean);
        }

        // Validazione progetti
        if (projects !== undefined) {
            if (Array.isArray(projects) && projects.length > 0) {
                for (const project of projects) {
                    if (!project.title || !project.description) {
                        throw new ApiError(400, 'Ogni progetto deve avere titolo e descrizione');
                    }
                }
            }
            user.projects = projects;
        }

        // Altri campi freelancer
        if (description !== undefined) {
            user.description = description.trim();
        }

        if (discord !== undefined) {
            user.discord = discord.trim();
        }

        if (slack !== undefined) {
            user.slack = slack.trim();
        }
    }

    await user.save();

    const updatedProfile = user.getPublicProfile();

    res.status(200).json({
        message: 'Profilo aggiornato con successo',
        profile: updatedProfile
    });
};

// GET /api/user/search - Cerca utenti
const searchUsers = async (req, res) => {
    const { role, skills, query } = req.query;

    const filter = { isActive: true };

    if (role) {
        filter.role = role.toUpperCase();
    }

    if (skills) {
        const skillsArray = skills.split(',').map(s => s.trim());
        filter.skills = { $in: skillsArray };
    }

    if (query) {
        filter.$or = [
            { nickname: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ];
    }

    const users = await User.find(filter)
        .select('address nickname role skills projects publishedJobs completedJobs')
        .limit(50)
        .exec();

    res.status(200).json(users);
};

// GET /api/user/stats/:address - Ottieni statistiche utente
const getUserStats = async (req, res) => {
    const { address } = req.params;

    const user = await User.findOne({
        address: address.toLowerCase().trim(),
        isActive: true
    }).exec();

    if (!user) {
        throw new ApiError(404, 'Utente non trovato');
    }

    const stats = {
        publishedJobs: user.publishedJobs || 0,
        completedJobs: user.completedJobs || 0,
        totalEarnings: user.totalEarnings || 0,
        totalSpent: user.totalSpent || 0,
    };

    res.status(200).json(stats);
};

// DELETE /api/user/:id - Elimina utente
const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'User id is missing.');
    }

    const targetUser = await User.findById(id).exec();

    if (!targetUser) {
        throw new ApiError(404, 'User not found.');
    }

    // Soft delete
    targetUser.isActive = false;
    await targetUser.save();

    // Oppure hard delete:
    // await targetUser.deleteOne();

    res.json({ message: 'User successfully deleted.' });
};

// ============================================
// GESTIONE UPLOAD IMMAGINI
// ============================================

// Helper function per caricare un file su GridFS
const uploadFileToGridFS = (bucket, file) => {
    return new Promise((resolve, reject) => {
        // Genera un ID univoco per il file
        const uniqueId = `${file.fieldname}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Crea uno stream leggibile dal buffer del file
        const readableStream = new Readable();
        readableStream.push(file.buffer);
        readableStream.push(null);

        // Apri uno stream di upload su GridFS
        const uploadStream = bucket.openUploadStream(file.originalname, {
            id: uniqueId,
            metadata: {
                contentType: file.mimetype,
            },
        });

        // Collega lo stream leggibile allo stream di upload
        readableStream.pipe(uploadStream);

        uploadStream.on('error', (err) => {
            console.error('Errore upload file:', err);
            reject(err);
        });

        uploadStream.on('finish', () => {
            resolve(uniqueId);
        });
    });
};

// POST /api/users/upload-images - Upload immagini progetti
const uploadProjectImages = (bucket) => {
    return async (req, res) => {
        try {
            const files = req.files;

            if (!files || files.length === 0) {
                return res.status(400).json({
                    error: 'Nessun file caricato',
                    success: false
                });
            }

            if (!bucket) {
                return res.status(500).json({
                    error: 'GridFS bucket non disponibile',
                    success: false
                });
            }

            // Validazioni
            const maxSize = 5 * 1024 * 1024; // 5MB
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

            // Verifica dimensione e tipo
            for (const file of files) {
                if (file.size > maxSize) {
                    return res.status(400).json({
                        error: `Il file ${file.originalname} supera i 5MB`,
                        success: false
                    });
                }

                if (!allowedTypes.includes(file.mimetype)) {
                    return res.status(400).json({
                        error: `Il file ${file.originalname} non è un tipo di immagine supportato`,
                        success: false
                    });
                }
            }

            // Upload di ogni file in GridFS
            const uploadedImageIds = [];

            for (const file of files) {
                try {
                    const imageId = await uploadFileToGridFS(bucket, file);
                    uploadedImageIds.push(imageId);
                } catch (err) {
                    console.error('Errore upload singolo file:', err);
                    // Continua con gli altri file anche se uno fallisce
                }
            }

            if (uploadedImageIds.length === 0) {
                return res.status(500).json({
                    error: 'Nessuna immagine è stata caricata con successo',
                    success: false
                });
            }

            res.status(200).json({
                success: true,
                imageIds: uploadedImageIds,
                message: `${uploadedImageIds.length} immagine/i caricata/e con successo`
            });

        } catch (error) {
            console.error('Errore upload immagini:', error);
            res.status(500).json({
                error: error.message || 'Errore durante l\'upload delle immagini',
                success: false
            });
        }
    };
};

module.exports = {
    getProfile,
    updateProfile,
    searchUsers,
    getUserStats,
    deleteUser,
    uploadProjectImages,
};