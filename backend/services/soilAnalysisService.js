const SoilTest = require('../models/SoilTest');
const SoilType = require('../models/SoilType');

/**
 * Evaluates completeness and parameter health of a soil test
 */
function analyzeSoilCondition(values, sources) {
  const expectedParams = ['moisture', 'temperature', 'pH', 'nitrogen', 'phosphorus', 'potassium', 'texture'];
  let testedCount = 0;
  const missing = [];

  const condition = {};

  expectedParams.forEach(param => {
    const val = values ? values[param] : null;
    const src = sources ? sources[param] : 'missing';

    if (val !== null && val !== undefined && val !== '') {
      testedCount++;
      let status = 'Normal';

      if (param === 'moisture') {
        if (val < 30) status = 'Dry / Water Deficit';
        else if (val > 75) status = 'Saturated / Waterlogged';
        else status = 'Adequate';
      } else if (param === 'temperature') {
        if (val < 15) status = 'Cool';
        else if (val > 35) status = 'Heat Stress';
        else status = 'Optimal';
      } else if (param === 'pH') {
        if (val < 6.0) status = 'Acidic';
        else if (val > 8.0) status = 'Alkaline';
        else status = 'Neutral / Favorable';
      } else if (param === 'nitrogen') {
        status = val < 70 ? 'Low' : val > 150 ? 'High' : 'Medium';
      } else if (param === 'phosphorus') {
        status = val < 30 ? 'Low' : val > 80 ? 'High' : 'Medium';
      } else if (param === 'potassium') {
        status = val < 35 ? 'Low' : val > 90 ? 'High' : 'Medium';
      } else if (param === 'texture') {
        status = 'Physical Characteristic';
      }

      condition[param] = {
        value: val,
        source: src,
        status
      };
    } else {
      missing.push(param);
      condition[param] = {
        value: null,
        source: 'missing',
        status: 'Not Tested'
      };
    }
  });

  const completenessScore = Math.round((testedCount / expectedParams.length) * 100);

  return {
    condition,
    dataCompleteness: {
      score: completenessScore,
      isComplete: completenessScore === 100,
      availableCount: testedCount,
      totalExpected: expectedParams.length,
      missingFields: missing
    }
  };
}

module.exports = {
  analyzeSoilCondition
};
