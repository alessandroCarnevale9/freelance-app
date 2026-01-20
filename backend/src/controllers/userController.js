const User = require('../models/UserModel');
const ApiError = require('../utils/ApiError');

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
        filter.skills = { $in: skillsArray };  // Usa 'skills' non 'keySkills'
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

module.exports = {
    getProfile,
    updateProfile,
    searchUsers,
    getUserStats,
    deleteUser,
};