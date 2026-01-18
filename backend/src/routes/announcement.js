const express = require('express');
const verifyJWT = require('../middlewares/verifyJWT');
const multer = require('multer');
const verifyRole = require('../middlewares/verifyRole');
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
    getAnnouncementDetailsClient,
    getAnnouncementDetailsFreelancer
} = require('../controllers/announcementController');

module.exports = (bucket) => {
    const storage = multer.memoryStorage();
    const upload = multer({ storage });
    router.use(verifyJWT);

    router.post('/add-candidate', verifyRole('FREELANCER'), addCandidate);
    router.delete('/delete-candidate', verifyRole('FREELANCER'), deleteCandidate);
    router.delete('/candidates/:announcementId', verifyRole('CLIENT'), deleteAllCandidatesForAnnouncement);
    router.get('/candidates/:announcementId', verifyRole('CLIENT'), getCandidatesByAnnouncement);
    router.get('/announcements/:candidateAddress', verifyRole('FREELANCER'), getAnnouncementsForCandidate);
    router.get('/announcements/registred/:candidateAddress', verifyRole('FREELANCER'), getRegistredAnnouncementsForCandidate);
    router.get('/announcements/registred/number/:candidateAddress', verifyRole('FREELANCER'), getRegistredAnnouncementsNumberForCandidate)
    router.get('/announcements/details/:announcementId', getAnnouncementDetails);
    router.get('/announcements/client-details/:announcementId', verifyRole('CLIENT'), getAnnouncementDetailsClient);
    router.get('/announcements/freelancer-details/:announcementId', verifyRole('FREELANCER'), getAnnouncementDetailsFreelancer);
    router.get('/announcements/freelancer/:freelancerAddress', verifyRole('FREELANCER'), getAnnouncementsForFreelancer)
    router.get('/announcements/client/:clientAddress', verifyRole('CLIENT'), getAnnouncementsForClient)
    router.post('/announcements/freelancer/project-upload', upload.any(), verifyRole('FREELANCER'), uploadProjectFileForAnnouncement(bucket))
    router.get('/announcements/project-name/:announcementId', getUploadedProjectNameForAnnouncement)
    router.delete('/announcements/project-delete/:announcementId', deleteProjectFileForAnnouncement(bucket))
    router.get('/project-download/:announcementId/:partialId', verifyRole('CLIENT'), async (req, res) => {
        if (!bucket) return res.status(500).json({ error: 'DB non pronto' });

        const {announcementId} = req.params;

        if (!announcementId) {
            throw new ApiError(400, "Missing announcementId");
        }

        try {
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

            if (
                (data.client === req.userAddress && data.status !== "Completed")
            ) {
                throw new ApiError(403, "Non autorizzato");
            }
        } catch (err) {
            if (err instanceof ApiError) {
                throw err;

            } else {
                throw new ApiError(500, err);
            }
        }


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



