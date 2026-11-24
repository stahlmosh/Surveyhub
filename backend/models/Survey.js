const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Survey title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    openDate: {
      type: Date,
      required: [true, 'Open date is required']
    },
    closeDate: {
      type: Date,
      required: [true, 'Close date is required'],
      validate: {
        validator: function (val) {
          return val > this.openDate;
        },
        message: 'Close date must be after open date'
      }
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    disabledReason: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Survey', surveySchema);
