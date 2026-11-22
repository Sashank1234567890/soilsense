const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  deviceId: { type: String, uppercase: true, trim: true, index: true },
  plotId: { type: String, uppercase: true, trim: true, index: true },
  type: {
    type: String,
    enum: [
      'CRITICAL_MOISTURE_LOW',
      'CRITICAL_MOISTURE_HIGH',
      'SOONER_NOTICE',
      'SENSOR_DISCONNECT',
      'ANOMALOUS_READING',
      'CALIBRATION_DRIFT',
      'STAGE_TRANSITION',
      'RAIN_SUPPRESSION',
      'CUSTOM_FARM_ALERT',
      'GENERAL'
    ],
    default: 'GENERAL'
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  message: { type: String, required: true },
  messageEn: { type: String },
  messageHi: { type: String },
  value: { type: Number },
  threshold: { type: Number },
  resolved: { type: Boolean, default: false },
  deduplicationKey: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

alertSchema.index({ user: 1, resolved: 1 });
alertSchema.index({ userId: 1, resolved: 1 });
alertSchema.index({ deduplicationKey: 1, resolved: 1 });
alertSchema.index({ timestamp: -1 });

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
