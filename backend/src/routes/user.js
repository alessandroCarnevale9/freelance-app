const express = require('express');
const multer = require('multer');
const {
    getProfile,
    updateProfile,
    searchUsers,
    getUserStats,
    deleteUser,
    uploadProjectImages
} = require('../controllers/userController');
const { validateUser } = require('../middlewares/userValidation');
const verifyJWT = require('../middlewares/verifyJWT');

// Configurazione Multer per upload immagini
const upload = multer({
    storage: multer.memoryStorage(), // Salva in memoria, non su disco
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 10 // Massimo 10 file per richiesta
    },
    fileFilter: (req, file, cb) => {
        // Accetta solo immagini
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo di file non supportato. Usa: JPEG, PNG, GIF, WEBP'));
        }
    }
});

// Esporta una funzione che riceve bucket e restituisce il router
module.exports = (bucket) => {
    const router = express.Router();

    // Route pubbliche
    // ... nessuna per ora

    // Route protette (richiedono autenticazione)
    router.use(verifyJWT); // Tutte le route sotto richiedono JWT

    // GET /api/users/profile/:address - Ottieni profilo pubblico di un utente
    router.get('/profile/:address', getProfile);

    // PUT /api/users/profile - Aggiorna il proprio profilo
    router.put('/profile', updateProfile);

    // POST /api/users/upload-images - Upload immagini per progetti (NUOVO)
    router.post('/upload-images', upload.array('files', 10), uploadProjectImages(bucket));

    // GET /api/users/search - Cerca utenti (filtri opzionali: role, skills, query)
    router.get('/search', searchUsers);

    // GET /api/users/stats/:address - Ottieni statistiche utente
    router.get('/stats/:address', getUserStats);

    // DELETE /api/users/:id - Elimina utente
    router.delete('/:id', deleteUser);

    return router;
};