const mongoose = require('mongoose');

const MarketROISchema = new mongoose.Schema({
  plotId: { type: String, required: true },
  cropName: { type: String, required: true },
  estimatedYieldQuintalsPerAcre: Number,
  currentMandiPricePerQuintalInr: Number,
  benchmarkMandiName: { type: String, default: 'e-NAM National / State Benchmark' },
  estimatedGrossRevenueInr: Number,
  estimatedInputCosts: {
    seedsInr: Number,
    fertilizersInr: Number,
    irrigationInr: Number,
    laborAndTillageInr: Number,
    totalCostInr: Number
  },
  projectedNetProfitInr: Number,
  roiPercentage: Number,
  calculatedAt: { type: Date, default: Date.now }
});

MarketROISchema.index({ plotId: 1, calculatedAt: -1 });

module.exports = mongoose.model('MarketROI', MarketROISchema);
