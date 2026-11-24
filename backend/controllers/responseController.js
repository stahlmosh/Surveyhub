const Survey = require('../models/Survey');
const Response = require('../models/Response');

const submitResponse = async (req, res, next) => {
  try {
    const { surveyId } = req.params;
    const { answers } = req.body;

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      res.status(404);
      throw new Error('Survey not found');
    }

    if (survey.isDisabled) {
      res.status(403);
      throw new Error('This survey has been disabled by an administrator');
    }

    const now = new Date();
    if (now < new Date(survey.openDate)) {
      res.status(400);
      throw new Error('This survey is not open yet');
    }
    if (now > new Date(survey.closeDate)) {
      res.status(400);
      throw new Error('This survey has already closed');
    }

    const response = await Response.create({
      survey: survey._id,
      respondent: req.user._id,
      answers
    });

    res.status(201).json({
      success: true,
      message: 'Response submitted successfully',
      response
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitResponse };
