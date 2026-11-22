const mongoose = require('mongoose');

const WeatherSnapshotSchema = new mongoose.Schema({
  plotId: { type: String, required: true, index: true },
  source: { type: String, default: 'IMD_OPEN_METEO_AGRO' },
  location: {
    district: { type: String, default: 'Ludhiana' },
    state: { type: String, default: 'Punjab' }
  },
  temperatureCelsius: { type: Number, default: 26.5 },
  humidityPercent: { type: Number, default: 62 },
  forecastRainNext24hMm: { type: Number, default: 0 },
  solarRadiationMjM2: { type: Number, default: 18.2 },
  referenceEvapotranspirationET0: { type: Number, default: 4.1 },
  recordedAt: { type: Date, default: Date.now, index: true }
});

WeatherSnapshotSchema.index({ plotId: 1, recordedAt: -1 });

module.exports = mongoose.model('WeatherSnapshot', WeatherSnapshotSchema);
