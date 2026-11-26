const SensorReading = require('../models/SensorReading');
const Plot = require('../models/Plot');
const { evaluateCropAlerts } = require('./cropScheduleService');

function initTelemetryScheduler() {
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;

  async function runCheckpoint(reason = '30_MIN_INTERVAL') {
    try {

      const latestReading = await SensorReading.findOne({
        deviceId: 'DEVICE_001',
        source: 'hardware'
      }).sort({ timestamp: -1 }).lean();

      if (!latestReading) return;

      const now = Date.now();
      const readingAgeMs = now - new Date(latestReading.timestamp).getTime();
      const isDeviceActive = readingAgeMs < 15 * 60 * 1000;

      const assignedPlots = await Plot.find({
        $or: [
          { assignedDeviceId: 'DEVICE_001' },
          { plotId: 'PLOT_001' }
        ]
      }).lean();

      for (const plot of assignedPlots) {

        if (isDeviceActive && reason === '30_MIN_INTERVAL') {
          const checkpointId = `DEV001_${plot.plotId}_30M_${now}`;
          await SensorReading.create({
            deviceId: 'DEVICE_001',
            plotId: plot.plotId,
            rawValue: latestReading.rawValue,
            moisturePercentage: latestReading.moisturePercentage,
            temperature: latestReading.temperature,
            timestamp: new Date(),
            source: 'hardware',
            ingestionId: checkpointId,
            metadata: {
              intervalType: '30_MIN_CHECKPOINT',
              loggedAt: new Date().toISOString()
            }
          });
        }

        await evaluateCropAlerts({
          plotId: plot.plotId,
          currentMoisture: latestReading.moisturePercentage
        });
      }

      console.log(`[TelemetryScheduler] Checkpoint executed (${reason}): Synchronized ${assignedPlots.length} farms to live moisture ${latestReading.moisturePercentage}%.`);
    } catch (err) {
      console.warn('[TelemetryScheduler Error]:', err.message);
    }
  }

  setTimeout(() => runCheckpoint('STARTUP_SYNC'), 5000);

  const interval = setInterval(() => runCheckpoint('30_MIN_INTERVAL'), THIRTY_MINUTES_MS);

  return {
    runCheckpoint,
    interval
  };
}

module.exports = {
  initTelemetryScheduler
};
