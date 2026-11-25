const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, uppercase: true, trim: true, index: true },
  plotId: { type: String, required: true, uppercase: true, trim: true, index: true },
  rawValue: { type: Number, required: true }, // ADC value (e.g. 0 - 1023)
  moisturePercentage: { type: Number, required: true, min: 0, max: 100 },
  temperature: { type: Number, default: null }, // Optional °C
  ledStatus: { type: String, enum: ['RED_ALERT', 'GREEN_OPTIMAL', 'OFF'], default: 'GREEN_OPTIMAL' },
  timestamp: { type: Date, default: Date.now, index: true },
  source: { type: String, enum: ['hardware', 'simulation'], required: true, default: 'simulation' },
  ingestionId: { type: String, required: true, unique: true, index: true }, // Deduplication / Idempotency UUID
  metadata: {
    dryADC: { type: Number, default: 820 },
    wetADC: { type: Number, default: 350 },
    isFlaggedAnomaly: { type: Boolean, default: false },
    batteryLevel: { type: Number, default: 100 },
    signalStrengthDbm: { type: Number, default: -65 }
  }
}, {
  timestamps: true
});

// Compound index for time-series range queries by device and plot
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });
sensorReadingSchema.index({ plotId: 1, timestamp: -1 });

module.exports = mongoose.models.SensorReading || mongoose.model('SensorReading', sensorReadingSchema, 'sensor_readings');
