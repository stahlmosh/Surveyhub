const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    selectedOptions: {
      type: [String],
      default: []
    },
    textAnswer: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    answers: {
      type: [answerSchema],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: 'At least one answer is required'
      }
    }
  },
  { timestamps: true }
);

responseSchema.index({ survey: 1, respondent: 1 }, { unique: true });

module.exports = mongoose.model('Response', responseSchema);
