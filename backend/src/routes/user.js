const express = require('express');
const {
    getProfile,
    updateProfile,
    searchUsers,
    getUserStats,
    deleteUser
} = require('../controllers/userController');
const { validateUser } = require('../middlewares/userValidation');
const verifyJWT = require('../middlewares/verifyJWT');

const router = express.Router();

// Route pubbliche
// ... nessuna per ora

// Route protette (richiedono autenticazione)
router.use(verifyJWT); // Tutte le route sotto richiedono JWT

// GET /api/user/profile/:address - Ottieni profilo pubblico di un utente
router.get('/profile/:address', getProfile);

// PUT /api/user/profile - Aggiorna il proprio profilo
router.put('/profile', updateProfile);

// GET /api/user/search - Cerca utenti (filtri opzionali: role, skills, query)
router.get('/search', searchUsers);

// GET /api/user/stats/:address - Ottieni statistiche utente
router.get('/stats/:address', getUserStats);

// DELETE /api/user/:id - Elimina utente
router.delete('/:id', deleteUser);

module.exports = router;