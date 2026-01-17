const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');
const multer = require('multer');
const router = express.Router();

const {
    addCandidate,
    deleteCandidate,
    deleteAllCandidatesForAnnouncement,
    getCandidatesByAnnouncement,
    getAnnouncementsForCandidate,
    getRegistredAnnouncementsForCandidate,
    getRegistredAnnouncementsNumberForCandidate,
    getAnnouncementDetails,
    getAnnouncementsForFreelancer,
    uploadProjectFileForAnnouncement,
    getUploadedProjectNameForAnnouncement,
    deleteProjectFileForAnnouncement,
    getAnnouncementsForClient,
} = require('../controllers/announcementController');

module.exports = (bucket) => {
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    // router.use(verifyJWT);

    router.post('/add-candidate', addCandidate);
    router.delete('/delete-candidate', deleteCandidate);
    router.delete('/candidates/:announcementId', deleteAllCandidatesForAnnouncement);
    router.get('/candidates/:announcementId', getCandidatesByAnnouncement);
    router.get('/announcements/:candidateAddress', getAnnouncementsForCandidate);
    router.get('/announcements/registred/:candidateAddress', getRegistredAnnouncementsForCandidate);
    router.get('/announcements/registred/number/:candidateAddress', getRegistredAnnouncementsNumberForCandidate)
    router.get('/announcements/details/:announcementId', getAnnouncementDetails);
    router.get('/announcements/freelancer/:freelancerAddress', getAnnouncementsForFreelancer)
    router.get('/announcements/client/:clientAddress', getAnnouncementsForClient)
    router.post('/announcements/freelancer/project-upload', upload.any(), uploadProjectFileForAnnouncement(bucket))
    router.get('/announcements/project-name/:announcementId', getUploadedProjectNameForAnnouncement)
    router.delete('/announcements/project-delete/:announcementId', deleteProjectFileForAnnouncement(bucket))
    router.get('/project-download/:partialId', async (req, res) => {
        if (!bucket) return res.status(500).json({ error: 'DB non pronto' });

        try {
            const regex = new RegExp(req.params.partialId, 'i');
            const files = await bucket.find({
                _id: { $regex: regex }
            }).limit(1).toArray();

            if (!files.length) {
                return res.status(404).json({ error: 'Progetto non trovato' });
            }

            res.set('Content-Disposition', `attachment; filename="${files[0].filename}"`);

            bucket.openDownloadStream(files[0]._id).pipe(res);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    });

    return router;
}



