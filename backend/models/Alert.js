const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  deviceId: { type: String, uppercase: true, trim: true, index: true },
  plotId: { type: String, uppercase: true, trim: true, index: true },
  type: {
    type: String,
    enum: ['CRITICAL_MOISTURE_LOW', 'CRITICAL_MOISTURE_HIGH', 'SENSOR_DISCONNECT', 'ANOMALOUS_READING', 'CALIBRATION_DRIFT'],
    required: true
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  message: { type: String, required: true },
  value: { type: Number },
  threshold: { type: Number },
  resolved: { type: Boolean, default: false },
  deduplicationKey: { type: String, required: true, index: true }, // e.g. "DEVICE_001_CRITICAL_MOISTURE_LOW_20261103"
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

alertSchema.index({ deduplicationKey: 1, resolved: 1 });
alertSchema.index({ timestamp: -1 });

module.exports = mongoose.models.Alert || mongoose.model('Alert', alertSchema);
