const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  plotId: { type: String, uppercase: true, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'calibrating', 'error'], default: 'active' },
  hardwareModel: { type: String, default: 'Arduino Uno + Capacitive Moisture V1.2' },
  calibration: {
    dryADC: { type: Number, default: 820 },
    wetADC: { type: Number, default: 350 }
  },
  lastHeartbeat: { type: Date, default: Date.now },
  source: { type: String, enum: ['hardware', 'simulation'], default: 'simulation' },
  firmwareVersion: { type: String, default: '1.0.0-ino' },
  metadata: {
    port: { type: String, default: '/dev/cu.usbmodem14101' },
    baudRate: { type: Number, default: 9600 }
  }
}, {
  timestamps: true
});

deviceSchema.index({ plotId: 1 });
deviceSchema.index({ status: 1 });

module.exports = mongoose.models.Device || mongoose.model('Device', deviceSchema);
