const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  soilTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SoilTest', required: true },
  plotId: { type: String, uppercase: true, trim: true },
  summary: { type: String, required: true },
  sections: {
    soilCondition: {
      moisture: { value: Number, source: String, status: String },
      temperature: { value: Number, source: String, status: String },
      pH: { value: Number, source: String, status: String },
      nitrogen: { value: Number, source: String, status: String },
      phosphorus: { value: Number, source: String, status: String },
      potassium: { value: Number, source: String, status: String },
      texture: { value: String, source: String, status: String }
    },
    soilClassification: {
      type: { type: String },
      texture: { type: String },
      fertilityCategory: { type: String },
      drainage: { type: String },
      characteristics: [{ type: String }],
      scientificHonestyNote: { type: String, default: 'Moisture and temperature sensors measure physical states only. Laboratory wet chemistry or soil core sampling is required for definitive mineral classification.' }
    },
    geographicContext: {
      state: String,
      district: String,
      village: String,
      plotName: String,
      sourceNotice: { type: String, default: 'Geographic information derived strictly from user registration / test input.' }
    },
    topRecommendedCrops: [{
      cropName: String,
      category: String,
      suitabilityLevel: String,
      suitabilityScore: Number,
      keyReason: String
    }],
    soilImprovementHighlights: [{
      parameter: String,
      recommendation: String,
      suggestedAmendments: [String]
    }],
    potentialAgriculturalUses: [{ type: String }]
  },
  generatedAt: { type: Date, default: Date.now },
  pdfUrl: { type: String }
}, {
  timestamps: true
});

analysisReportSchema.index({ soilTestId: 1 });
analysisReportSchema.index({ generatedAt: -1 });

module.exports = mongoose.models.AnalysisReport || mongoose.model('AnalysisReport', analysisReportSchema, 'analysis_reports');
