const mongoose = require('mongoose');

const SoilHealthCardSchema = new mongoose.Schema({
  cardId: { type: String, unique: true, required: true },
  farmerProfile: {
    farmerName: { type: String, required: true },
    phone: String,
    district: String,
    state: String,
    landHoldingAcre: { type: Number, default: 2.0 },
    preferredLanguage: { type: String, default: 'hi' }
  },
  plotDetails: {
    plotIdentifier: { type: String, default: 'PLOT_001' },
    soilType: { type: String, default: 'Alluvial Soil' }
  },
  chemicalParameters: {
    // Macro
    nitrogen_kg_ha: { value: Number, rating: String },
    phosphorus_kg_ha: { value: Number, rating: String },
    potassium_kg_ha: { value: Number, rating: String },
    // Secondary
    sulphur_ppm: { value: Number, rating: String },
    // Micro
    zinc_ppm: { value: Number, rating: String },
    iron_ppm: { value: Number, rating: String },
    copper_ppm: { value: Number, rating: String },
    manganese_ppm: { value: Number, rating: String },
    boron_ppm: { value: Number, rating: String },
    // Physical
    pH: { value: Number, rating: String },
    electricalConductivity_dS_m: { value: Number, rating: String },
    organicCarbonPercent: { value: Number, rating: String }
  },
  overallHealthRating: {
    type: String,
    enum: ['EXCELLENT', 'GOOD', 'MODERATE', 'DEGRADED', 'ACIDIC_ALERT', 'SALINE_ALERT'],
    default: 'GOOD'
  },
  qrVerificationHash: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SoilHealthCard', SoilHealthCardSchema);
