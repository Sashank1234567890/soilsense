const WeatherSnapshot = require('../models/WeatherSnapshot');
const IrrigationAdvisory = require('../models/IrrigationAdvisory');
const Plot = require('../models/Plot');
const CropSchedule = require('../models/CropSchedule');
const { fetchLiveWeather } = require('./weatherService');

async function evaluateIrrigation({ plotId = 'PLOT_001', cropName = 'Wheat', cropStage = 'VEGETATIVE', currentMoisture = 36.5, acreage = 1.0 }) {
  // 1. Fetch plot details to get true geographic coordinates
  const plot = await Plot.findOne({ plotId }).lean();
  const schedule = await CropSchedule.findOne({ plotId, status: 'ACTIVE' }).lean();

  const lat = schedule?.location?.lat || plot?.location?.coordinates?.latitude || (plotId === 'PLOT_STU_001' ? 28.77 : 30.9010);
  const lon = schedule?.location?.lon || plot?.location?.coordinates?.longitude || (plotId === 'PLOT_STU_001' ? 77.19 : 75.8573);
  const district = schedule?.location?.district || plot?.location?.district || 'Delhi';
  const state = schedule?.location?.state || plot?.location?.state || 'Delhi';

  // 2. Fetch live accurate weather directly from Open-Meteo
  const liveWeather = await fetchLiveWeather({ lat, lon, district, state, plotId });

  const cropTargets = {
    Wheat: { optimal: 55, wiltingPoint: 25 },
    Rice: { optimal: 80, wiltingPoint: 45 },
    Mustard: { optimal: 40, wiltingPoint: 18 },
    Maize: { optimal: 50, wiltingPoint: 22 },
    Cotton: { optimal: 48, wiltingPoint: 20 },
    Sugarcane: { optimal: 70, wiltingPoint: 35 }
  };

  const effCrop = schedule?.cropName || plot?.currentCrop || cropName || 'Wheat';
  const target = schedule?.moistureThresholds?.optimal || cropTargets[effCrop]?.optimal || 55;
  const wiltingPoint = schedule?.notifications?.criticalThreshold || schedule?.moistureThresholds?.criticalWilting || cropTargets[effCrop]?.wiltingPoint || 24;

  // Rain skip triggers ONLY if meaningful rainfall >= 5.0 mm AND precipitation probability >= 50%
  const isRainForecasted = (liveWeather.forecastRainNext24hMm >= 5.0) && (liveWeather.precipitationProbabilityMax >= 50);

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
  const effAcreage = +acreage || schedule?.acreage || plot?.areaAcres || 1.0;
  const recommendedWaterVolumeLiters = Math.max(0, Math.round(waterDepthMm * 4047 * effAcreage));

  const advisory = await IrrigationAdvisory.create({
    plotId,
    cropName: effCrop,
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

  const advisoryObj = advisory.toObject();
  advisoryObj.forecastRainNext24hMm = liveWeather.forecastRainNext24hMm;
  advisoryObj.precipitationProbabilityMax = liveWeather.precipitationProbabilityMax;
  advisoryObj.weatherConditionEn = liveWeather.weatherConditionEn;
  advisoryObj.weatherConditionHi = liveWeather.weatherConditionHi;
  advisoryObj.weather = liveWeather;

  return advisoryObj;
}

module.exports = { evaluateIrrigation };
