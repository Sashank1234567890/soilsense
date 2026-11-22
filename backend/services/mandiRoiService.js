const MarketROI = require('../models/MarketROI');

const MANDI_BENCHMARKS = [
  { cropName: 'Wheat', mandiPrice: 2275, yieldQuintal: 22, seedsCost: 2200, fertCost: 4500, waterCost: 3500, laborCost: 8000 },
  { cropName: 'Mustard', mandiPrice: 5450, yieldQuintal: 8.5, seedsCost: 1500, fertCost: 3200, waterCost: 2200, laborCost: 7000 },
  { cropName: 'Rice (Basmati)', mandiPrice: 3850, yieldQuintal: 18, seedsCost: 2500, fertCost: 5500, waterCost: 6500, laborCost: 9500 },
  { cropName: 'Maize', mandiPrice: 1950, yieldQuintal: 24, seedsCost: 2400, fertCost: 4200, waterCost: 3000, laborCost: 7500 },
  { cropName: 'Gram (Chickpea)', mandiPrice: 5350, yieldQuintal: 7.5, seedsCost: 3000, fertCost: 2200, waterCost: 1500, laborCost: 6000 }
];

async function calculateMarketROI({ plotId, cropName }) {
  const match = MANDI_BENCHMARKS.find(b => b.cropName.toLowerCase() === (cropName || 'Wheat').toLowerCase()) 
    || MANDI_BENCHMARKS[0];

  const grossRevenue = match.yieldQuintal * match.mandiPrice;
  const totalCost = match.seedsCost + match.fertCost + match.waterCost + match.laborCost;
  const netProfit = grossRevenue - totalCost;
  const roi = Math.round((netProfit / totalCost) * 100);

  const roiRecord = await MarketROI.create({
    plotId,
    cropName: match.cropName,
    estimatedYieldQuintalsPerAcre: match.yieldQuintal,
    currentMandiPricePerQuintalInr: match.mandiPrice,
    benchmarkMandiName: 'Agmarknet / e-NAM Punjab & Haryana Benchmark',
    estimatedGrossRevenueInr: grossRevenue,
    estimatedInputCosts: {
      seedsInr: match.seedsCost,
      fertilizersInr: match.fertCost,
      irrigationInr: match.waterCost,
      laborAndTillageInr: match.laborCost,
      totalCostInr: totalCost
    },
    projectedNetProfitInr: netProfit,
    roiPercentage: roi
  });

  return {
    current: roiRecord,
    comparison: MANDI_BENCHMARKS.map(b => {
      const gross = b.yieldQuintal * b.mandiPrice;
      const cost = b.seedsCost + b.fertCost + b.waterCost + b.laborCost;
      return {
        cropName: b.cropName,
        yieldQuintalAcre: b.yieldQuintal,
        mandiPriceQtl: b.mandiPrice,
        grossRevenueInr: gross,
        totalCostInr: cost,
        netProfitInr: gross - cost,
        roiPct: Math.round(((gross - cost) / cost) * 100)
      };
    })
  };
}

module.exports = { calculateMarketROI };
