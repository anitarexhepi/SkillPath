const express = require('express');

const jobController = require('../controllers/job.controller');
const {
  authenticateToken
} = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', jobController.getAllJobs);

router.post(
  '/',
  authenticateToken,
  jobController.createJob
);

module.exports = router;