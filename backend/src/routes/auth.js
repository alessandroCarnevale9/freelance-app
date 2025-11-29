const express = require('express')
const multer = require('multer');

const {
  login,
  refresh,
  logout,
  nonce,
  metamaskSignup,
  freelancerSignup
} = require('../controllers/authController')
const loginLimiter = require('../middlewares/loginLimiter');

module.exports = (bucket) => {
  const router = express.Router()

  const storage = multer.memoryStorage();
  const upload = multer({
    storage
  });

  router.post('/', loginLimiter, login)
  router.get('/refresh', refresh)
  router.post('/logout', logout)

  router.get('/nonce', nonce)
  router.post('/signup', metamaskSignup)
  router.post('/freelancer-signup', upload.any(), freelancerSignup(bucket));

  router.get('/image/view/:partialId', async (req, res) => {
    if (!bucket) return res.status(500).send('DB non pronto');

    try {
      const regex = new RegExp(req.params.partialId, 'i');
      const files = await bucket.find({
        _id: {
          $regex: regex
        }
      }).limit(1).toArray();

      if (!files.length) return res.status(404).send('Not Found');

      bucket.openDownloadStream(files[0]._id).pipe(res);
    } catch (e) {
      res.status(500).send(e.message);
    }
  });

  return router
}

