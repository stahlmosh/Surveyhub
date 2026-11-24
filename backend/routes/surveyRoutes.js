const express = require('express');
const router = express.Router();
const {
  createSurvey,
  getMySurveys,
  getAllSurveysAdmin,
  getSurveyById,
  toggleDisableSurvey,
  getSurveyResults
} = require('../controllers/surveyController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/', protect, authorizeRoles('owner', 'admin'), createSurvey);
router.get('/my', protect, authorizeRoles('owner', 'admin'), getMySurveys);
router.get('/:id/results', protect, authorizeRoles('owner', 'admin'), getSurveyResults);

router.get('/admin/all', protect, authorizeRoles('admin'), getAllSurveysAdmin);
router.patch('/:id/disable', protect, authorizeRoles('admin'), toggleDisableSurvey);

router.get('/:id', getSurveyById);

module.exports = router;
