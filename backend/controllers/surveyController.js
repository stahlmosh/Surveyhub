const mongoose = require('mongoose');
const Survey = require('../models/Survey');
const Question = require('../models/Question');
const Response = require('../models/Response');

const createSurvey = async (req, res, next) => {
  try {
    const { title, description, openDate, closeDate, questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400);
      throw new Error('A survey must contain at least one question');
    }

    const survey = await Survey.create({
      title,
      description,
      owner: req.user._id,
      openDate,
      closeDate
    });

    const formattedQuestions = questions.map((q, index) => ({
      survey: survey._id,
      questionText: q.questionText,
      type: q.type,
      options: q.type === 'text' ? [] : q.options,
      order: index
    }));

    const createdQuestions = await Question.insertMany(formattedQuestions);

    res.status(201).json({
      success: true,
      survey,
      questions: createdQuestions
    });
  } catch (error) {
    next(error);
  }
};

const getMySurveys = async (req, res, next) => {
  try {
    const surveys = await Survey.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, surveys });
  } catch (error) {
    next(error);
  }
};

const getAllSurveysAdmin = async (req, res, next) => {
  try {
    const surveys = await Survey.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, surveys });
  } catch (error) {
    next(error);
  }
};

const getSurveyById = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id).populate('owner', 'name');
    if (!survey) {
      res.status(404);
      throw new Error('Survey not found');
    }

    const questions = await Question.find({ survey: survey._id }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      survey,
      questions
    });
  } catch (error) {
    next(error);
  }
};

const toggleDisableSurvey = async (req, res, next) => {
  try {
    const { isDisabled, disabledReason } = req.body;
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      res.status(404);
      throw new Error('Survey not found');
    }

    survey.isDisabled = typeof isDisabled === 'boolean' ? isDisabled : true;
    survey.disabledReason = survey.isDisabled
      ? disabledReason || 'Disabled by administrator due to policy violation'
      : '';

    await survey.save();

    res.status(200).json({
      success: true,
      message: survey.isDisabled ? 'Survey disabled' : 'Survey re-enabled',
      survey
    });
  } catch (error) {
    next(error);
  }
};

const getSurveyResults = async (req, res, next) => {
  try {
    const surveyId = new mongoose.Types.ObjectId(req.params.id);
    const survey = await Survey.findById(surveyId);

    if (!survey) {
      res.status(404);
      throw new Error('Survey not found');
    }

    if (
      survey.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403);
      throw new Error('Not authorized to view results for this survey');
    }

    const totalResponses = await Response.countDocuments({ survey: surveyId });
    const questions = await Question.find({ survey: surveyId }).sort({ order: 1 }).lean();

    const optionStats = await Response.aggregate([
      { $match: { survey: surveyId } },
      { $unwind: '$answers' },
      { $unwind: '$answers.selectedOptions' },
      {
        $group: {
          _id: {
            questionId: '$answers.question',
            option: '$answers.selectedOptions'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const textStats = await Response.aggregate([
      { $match: { survey: surveyId } },
      { $unwind: '$answers' },
      { $match: { 'answers.textAnswer': { $ne: '' } } },
      {
        $group: {
          _id: '$answers.question',
          responses: { $push: '$answers.textAnswer' }
        }
      }
    ]);

    const analyzedQuestions = questions.map((q) => {
      if (q.type === 'text') {
        const foundText = textStats.find(
          (t) => t._id.toString() === q._id.toString()
        );
        return {
          ...q,
          textResponses: foundText ? foundText.responses : []
        };
      }

      const breakdown = q.options.map((opt) => {
        const foundOpt = optionStats.find(
          (s) =>
            s._id.questionId.toString() === q._id.toString() &&
            s._id.option === opt
        );
        const count = foundOpt ? foundOpt.count : 0;
        const percentage =
          totalResponses > 0 ? Number(((count / totalResponses) * 100).toFixed(1)) : 0;
        return { option: opt, count, percentage };
      });

      return {
        ...q,
        breakdown
      };
    });

    res.status(200).json({
      success: true,
      survey,
      totalResponses,
      results: analyzedQuestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSurvey,
  getMySurveys,
  getAllSurveysAdmin,
  getSurveyById,
  toggleDisableSurvey,
  getSurveyResults
};
