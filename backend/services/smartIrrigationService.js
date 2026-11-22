const WeatherSnapshot = require('../models/WeatherSnapshot');
const IrrigationAdvisory = require('../models/IrrigationAdvisory');

async function evaluateIrrigation({ plotId, cropName = 'Wheat', cropStage = 'VEGETATIVE', currentMoisture, acreage = 1.0 }) {
  const latestWeather = await WeatherSnapshot.findOne({ plotId }).sort({ recordedAt: -1 }).lean() || {
    forecastRainNext24hMm: 0,
    referenceEvapotranspirationET0: 4.2
  };

  const cropTargets = {
    Wheat: { optimal: 55, wiltingPoint: 25 },
    Rice: { optimal: 80, wiltingPoint: 45 },
    Mustard: { optimal: 40, wiltingPoint: 18 },
    Maize: { optimal: 50, wiltingPoint: 22 },
    Cotton: { optimal: 48, wiltingPoint: 20 },
    Sugarcane: { optimal: 70, wiltingPoint: 35 }
  };

  const target = cropTargets[cropName]?.optimal || 50;
  const wiltingPoint = cropTargets[cropName]?.wiltingPoint || 20;

  const isRainForecasted = latestWeather.forecastRainNext24hMm >= 5.0;

  let urgency = 'OPTIMAL';
  let waterDepthMm = 0;
  let status = 'PENDING';

  if (isRainForecasted && currentMoisture > wiltingPoint) {
    urgency = 'RAIN_SUPPRESSED';
    status = 'SKIPPED';
    waterDepthMm = 0;
  } else if (currentMoisture < wiltingPoint) {
    urgency = 'CRITICAL';
    waterDepthMm = Math.max(15, (target - currentMoisture) * 0.8);
  } else if (currentMoisture < target - 10) {
    urgency = 'URGENT';
    waterDepthMm = (target - currentMoisture) * 0.6;
  } else if (currentMoisture < target) {
    urgency = 'MODERATE';
    waterDepthMm = (target - currentMoisture) * 0.4;
  } else {
    urgency = 'OPTIMAL';
    waterDepthMm = 0;
  }

  // 1 mm depth over 1 acre = ~4047 Liters
  const recommendedWaterVolumeLiters = Math.max(0, Math.round(waterDepthMm * 4047 * acreage));

  const advisory = await IrrigationAdvisory.create({
    plotId,
    cropName,
    cropStage,
    currentMoisture,
    targetMoisture: target,
    urgency,
    recommendedWaterDepthMm: +waterDepthMm.toFixed(1),
    recommendedWaterVolumeLiters,
    optimalWindow: {
      startTime: '05:30 AM',
      endTime: '07:30 AM'
    },
    rainSkipTriggered: isRainForecasted,
    status
  });

  return advisory;
}

module.exports = { evaluateIrrigation };
