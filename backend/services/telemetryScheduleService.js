const SensorReading = require('../models/SensorReading');
const Plot = require('../models/Plot');
const { evaluateCropAlerts } = require('./cropScheduleService');

/**
 * Periodically records milestone readings (every 30 mins) and evaluates alerts for all farms using the hardware device.
 */
function initTelemetryScheduler() {
  const THIRTY_MINUTES_MS = 30 * 60 * 1000;

  async function runCheckpoint(reason = '30_MIN_INTERVAL') {
    try {
      // Find latest hardware reading for DEVICE_001
      const latestReading = await SensorReading.findOne({
        deviceId: 'DEVICE_001',
        source: 'hardware'
      }).sort({ timestamp: -1 }).lean();

      if (!latestReading) return;

      const now = Date.now();
      const readingAgeMs = now - new Date(latestReading.timestamp).getTime();
      const isDeviceActive = readingAgeMs < 15 * 60 * 1000;

      // Find all plots assigned to DEVICE_001
      const assignedPlots = await Plot.find({
        $or: [
          { assignedDeviceId: 'DEVICE_001' },
          { plotId: 'PLOT_001' }
        ]
      }).lean();

      for (const plot of assignedPlots) {
        // Record regular interval reading for this plot if device is active
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

        // Evaluate crop alerts for each farm using this hardware reading
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

  // Initial sync 5 seconds after startup
  setTimeout(() => runCheckpoint('STARTUP_SYNC'), 5000);

  // Periodic 30-minute interval
  const interval = setInterval(() => runCheckpoint('30_MIN_INTERVAL'), THIRTY_MINUTES_MS);

  return {
    runCheckpoint,
    interval
  };
}

module.exports = {
  initTelemetryScheduler
};
