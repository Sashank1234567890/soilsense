const DiseaseRisk = require('../models/DiseaseRisk');

async function assessDiseaseRisk({ plotId, cropName = 'Wheat', recentReadings = [] }) {
  const avgMoisture = recentReadings.length > 0
    ? recentReadings.reduce((sum, r) => sum + r.moisture, 0) / recentReadings.length
    : 45.0;

  const isSaturated = avgMoisture >= 80.0;

  let riskLevel = 'LOW';
  let diseaseName = 'Soil Aeration Normal (No Active Hypoxia)';
  let actions = ['Continue normal monitoring schedule'];

  if (isSaturated) {
    riskLevel = 'HIGH';
    diseaseName = 'Pythium Damping-Off & Rhizoctonia Root Rot Hazard';
    actions = [
      'IMMEDIATELY HALT all irrigation pumping',
      'Dig 15 cm deep surface drainage trenches along plot borders to evacuate excess water',
      'Apply Trichoderma viride biological fungicide @ 2.5 kg/acre mixed with well-rotted FYM'
    ];
  } else if (avgMoisture < 22.0) {
    riskLevel = 'MODERATE';
    diseaseName = 'Severe Moisture Stress & Subterranean Termite Vulnerability';
    actions = [
      'Schedule a light surface irrigation cycle during early morning hours',
      'Inspect root collar for dry stem rot symptoms'
    ];
  }

  const record = await DiseaseRisk.create({
    plotId,
    cropName,
    diseaseName,
    riskLevel,
    triggerConditions: {
      soilMoistureExceededThreshold: isSaturated,
      consecutiveHoursWet: isSaturated ? 48 : 0
    },
    preventativeActions: actions
  });

  return record;
}

module.exports = { assessDiseaseRisk };
