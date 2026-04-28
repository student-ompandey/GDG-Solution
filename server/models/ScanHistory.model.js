const mongoose = require('mongoose');

/**
 * ScanHistory schema — records every scan performed on the platform.
 * Supports both authenticated and anonymous scans.
 */
const scanHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous scan
    },
    type: {
      type: String,
      required: true,
      enum: ['url', 'message', 'qr', 'image'],
    },
    input: {
      type: String,
      required: [true, 'Input data is required'],
      trim: true,
    },
    result: {
      type: String,
      required: true,
      enum: ['safe', 'suspicious', 'dangerous'],
    },
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    explanation: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
);

// Index for efficient user history queries
scanHistorySchema.index({ user: 1, createdAt: -1 });
scanHistorySchema.index({ type: 1 });

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
