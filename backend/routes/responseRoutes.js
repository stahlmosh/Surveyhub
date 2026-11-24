const express = require('express');
const router = express.Router();
const { submitResponse } = require('../controllers/responseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:surveyId', protect, submitResponse);

module.exports = router;
