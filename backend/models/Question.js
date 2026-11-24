const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Survey',
      required: true,
      index: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['single_choice', 'multiple_choice', 'text'],
      required: true
    },
    options: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          if (this.type === 'text') return true;
          return Array.isArray(arr) && arr.length >= 2;
        },
        message: 'Choice questions must have at least 2 options'
      }
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
