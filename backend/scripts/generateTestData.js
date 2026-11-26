const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SensorReading = require('../models/SensorReading');
const SoilTest = require('../models/SoilTest');

dotenv.config();

async function generateTestData() {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/soilsense?replicaSet=rs0';
    await mongoose.connect(connStr);
    console.log('[GenerateData] Connected to MongoDB.');

    const devices = ['DEVICE_001', 'DEVICE_002', 'DEVICE_003', 'DEVICE_004', 'DEVICE_005'];
    const plots = ['PLOT_001', 'PLOT_002', 'PLOT_003', 'PLOT_004', 'PLOT_005'];

    console.log('[GenerateData] Generating 5,000 telemetry sensor readings across 30 days...');
    const readingsBatch = [];
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 3600 * 1000;

    for (let i = 0; i < 5000; i++) {
      const devIndex = i % devices.length;
      const deviceId = devices[devIndex];
      const plotId = plots[devIndex];
      const randomTimeOffset = Math.floor(Math.random() * thirtyDaysMs);
      const timestamp = new Date(now - randomTimeOffset);

      const moisturePercentage = Math.round((20 + Math.random() * 60) * 10) / 10;
      const rawADC = Math.round(820 - (moisturePercentage / 100.0) * (820 - 350));
      const temperature = Math.round((18 + Math.random() * 15) * 10) / 10;

      readingsBatch.push({
        deviceId,
        plotId,
        rawValue: rawADC,
        moisturePercentage,
        temperature,
        timestamp,
        source: i % 10 === 0 ? 'hardware' : 'simulation',
        ingestionId: `BENCHMARK_${deviceId}_${timestamp.getTime()}_${i}`,
        metadata: {
          batteryLevel: 95,
          signalStrengthDbm: -68
        }
      });
    }

    try {
      await SensorReading.insertMany(readingsBatch, { ordered: false });
    } catch (e) {

    }

    const count = await SensorReading.countDocuments();
    console.log(`[GenerateData Success] Total sensor_readings in database: ${count}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[GenerateData Error]:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  generateTestData();
}

module.exports = generateTestData;
