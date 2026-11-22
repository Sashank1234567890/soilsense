const mongoose = require('mongoose');

const soilProfileSchema = new mongoose.Schema({
  profileId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plotId: { type: String, uppercase: true, trim: true },
  soilTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'SoilType' },
  soilTypeName: { type: String, trim: true },
  location: {
    state: { type: String, required: true },
    district: { type: String, required: true },
    village: { type: String },
    plotName: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  historicalTestRefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SoilTest' }],
  baselineValues: {
    pH: { type: Number },
    moisture: { type: Number },
    nitrogen: { type: Number },
    phosphorus: { type: Number },
    potassium: { type: Number },
    texture: { type: String },
    organicMatter: { type: Number }
  },
  metadata: {
    notes: { type: String },
    verifiedByLab: { type: Boolean, default: false },
    labReportNumber: { type: String }
  }
}, {
  timestamps: true
});

soilProfileSchema.index({ plotId: 1 });
soilProfileSchema.index({ 'location.state': 1, 'location.district': 1 });

module.exports = mongoose.models.SoilProfile || mongoose.model('SoilProfile', soilProfileSchema, 'soil_profiles');
