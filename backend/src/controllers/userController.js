const User = require('../models/UserModel');
const ApiError = require('../utils/ApiError');
const bcrypt = require('bcrypt');

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
    // req.userId è popolato dal middleware verifyJWT
    const userId = req.userId;

    if (!userId) {
        throw new ApiError(401, 'Non autorizzato');
    }

    const {
        nickname,
        email,
        phone,
        skills,  // dal frontend arriva come 'skills'
        projects,
        github,
        portfolio
    } = req.body;

    const user = await User.findById(userId).exec();

    if (!user) {
        throw new ApiError(404, 'Utente non trovato');
    }

    // Validazione nickname
    if (nickname && nickname.trim().length < 2) {
        throw new ApiError(400, 'Il nickname deve essere di almeno 2 caratteri');
    }

    // Validazione email
    if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, 'Email non valida');
        }
    }

    // Validazione URL
    const urlRegex = /^https?:\/\/.+/i;
    if (github && github.trim() !== '' && !urlRegex.test(github)) {
        throw new ApiError(400, 'URL GitHub non valido');
    }
    if (portfolio && portfolio.trim() !== '' && !urlRegex.test(portfolio)) {
        throw new ApiError(400, 'URL Portfolio non valido');
    }

    // Validazione specifica per Freelancer
    if (user.role === 'FREELANCER') {
        if (skills && (!Array.isArray(skills) || skills.length === 0)) {
            throw new ApiError(400, 'I freelancer devono avere almeno una skill');
        }

        if (projects && Array.isArray(projects)) {
            for (const project of projects) {
                if (!project.title || !project.description) {
                    throw new ApiError(400, 'Ogni progetto deve avere titolo e descrizione');
                }
            }
        }
    }

    // Aggiorna i campi
    if (nickname) user.nickname = nickname.trim();
    if (email !== undefined) user.email = email.trim();
    if (phone !== undefined) user.phone = phone.trim();

    // Campi specifici freelancer
    if (user.role === 'FREELANCER') {
        // Il frontend manda 'skills', ma nel DB è 'keySkills'
        if (skills) user.keySkills = skills.map(s => s.trim()).filter(Boolean);
        if (projects !== undefined) user.projects = projects;
        if (github !== undefined) user.github = github.trim();
        if (portfolio !== undefined) user.portfolio = portfolio.trim();
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
        filter.keySkills = { $in: skillsArray };
    }

    if (query) {
        filter.$or = [
            { nickname: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
        ];
    }

    const users = await User.find(filter)
        .select('address nickname role keySkills projects publishedJobs completedJobs')
        .limit(50)
        .exec();

    // Trasforma keySkills in skills per il frontend
    const transformedUsers = users.map(user => ({
        ...user.toObject(),
        skills: user.keySkills,
    }));

    res.status(200).json(transformedUsers);
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
        publishedJobs: user.publishedJobs,
        completedJobs: user.completedJobs,
        totalEarnings: user.totalEarnings || 0,
        totalSpent: user.totalSpent || 0,
    };

    res.status(200).json(stats);
};

// DELETE /api/user/:id - Elimina utente (già esistente)
const deleteUser = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, 'User id is missing.');
    }

    const targetUser = await User.findById(id).exec();

    if (!targetUser) {
        throw new ApiError(404, 'User not found.');
    }

    // *** aggiungere controlli su chi fa cosa... ***
    await targetUser.deleteOne();

    res.json({ message: 'User successfully deleted.' });
};

module.exports = {
    getProfile,
    updateProfile,
    searchUsers,
    getUserStats,
    deleteUser,
};