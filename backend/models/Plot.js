const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  plotId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  areaAcres: { type: Number, default: 1.0 },
  soilProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'SoilProfile' },
  assignedDeviceId: { type: String, trim: true },
  location: {
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    locality: { type: String, trim: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  currentCrop: { type: String, default: 'None' },
  lastTestedAt: { type: Date },
  status: { type: String, enum: ['active', 'fallow', 'harvested'], default: 'active' }
}, {
  timestamps: true
});

plotSchema.index({ 'location.state': 1, 'location.district': 1 });

module.exports = mongoose.models.Plot || mongoose.model('Plot', plotSchema);
