const mongoose = require('mongoose');

/**
 * ScamReport schema — community-reported scam content.
 * Tracks how many times the same content has been reported
 * and stores the AI analysis metadata for trending display.
 */
const scamReportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Report type is required'],
      enum: ['url', 'message', 'qr', 'image', 'audio'],
    },
    content: {
      type: String,
      required: [true, 'Report content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      required: true,
      enum: ['safe', 'low', 'medium', 'high', 'critical'],
    },
    signals: {
      type: [String],
      default: [],
    },
    explanation: {
      type: [String],
      default: [],
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    reportCount: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Indexes for efficient querying
scamReportSchema.index({ reportCount: -1, createdAt: -1 });
scamReportSchema.index({ content: 1, type: 1 }); // fast duplicate lookup
scamReportSchema.index({ type: 1 });

module.exports = mongoose.model('ScamReport', scamReportSchema);
