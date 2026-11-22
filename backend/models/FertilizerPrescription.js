const mongoose = require('mongoose');

const FertilizerPrescriptionSchema = new mongoose.Schema({
  plotId: { type: String, required: true, index: true },
  cropName: { type: String, required: true },
  cropStage: { type: String, required: true },
  soilNPK: {
    nitrogen_kg_ha: { type: Number, default: 240 },
    phosphorus_kg_ha: { type: Number, default: 18 },
    potassium_kg_ha: { type: Number, default: 180 },
    pH: { type: Number, default: 7.2 },
    organicCarbonPercent: { type: Number, default: 0.55 }
  },
  chemicalDosage: [{
    fertilizerName: String,
    quantityKgPerAcre: Number,
    applicationMethod: String,
    timing: String
  }],
  organicAlternatives: [{
    amendmentName: String,
    quantityKgPerAcre: Number,
    soilHealthBenefit: String
  }],
  createdAt: { type: Date, default: Date.now }
});

FertilizerPrescriptionSchema.index({ plotId: 1, cropName: 1 });

module.exports = mongoose.model('FertilizerPrescription', FertilizerPrescriptionSchema);
