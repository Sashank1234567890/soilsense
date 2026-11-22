/**
 * SoilSense: Multi-Plot IoT Telemetry Simulator
 * Generates realistic physical soil moisture drift, diurnal temperature variations,
 * and irrigation events across multiple agricultural test plots.
 * 
 * STRICT ARCHITECTURAL RULE:
 * Telemetry enters through the EXACT SAME Express API endpoint (/api/sensor/readings)
 * and is always persisted with source: "simulation".
 */

const http = require('http');

class SoilSenseSimulator {
  constructor(options = {}) {
    this.apiHost = options.apiHost || '127.0.0.1';
    this.apiPort = options.apiPort || parseInt(process.env.PORT) || 5002;
    this.apiPath = options.apiPath || '/api/sensor/readings';
    this.intervalMs = options.intervalMs || 4000;
    this.timer = null;
    this.stepCount = 0;

    // Simulation states for distinct agro-climatic plots
    this.plots = [
      {
        plotId: 'PLOT_001',
        deviceId: 'DEVICE_001',
        soilType: 'Alluvial Soil',
        currentMoisture: 48.0,
        dryingRate: 0.15,
        irrigationThreshold: 32.0,
        irrigationBoost: 30.0,
        dryADC: 820,
        wetADC: 350
      },
      {
        plotId: 'PLOT_002',
        deviceId: 'DEVICE_002',
        soilType: 'Black Soil',
        currentMoisture: 44.0,
        dryingRate: 0.08, // Vertisols dry much slower due to clay content
        irrigationThreshold: 28.0,
        irrigationBoost: 25.0,
        dryADC: 825,
        wetADC: 345
      },
      {
        plotId: 'PLOT_003',
        deviceId: 'DEVICE_003',
        soilType: 'Sandy Soil',
        currentMoisture: 26.0,
        dryingRate: 0.35, // Sandy soils leach and dry very fast
        irrigationThreshold: 18.0,
        irrigationBoost: 35.0,
        dryADC: 815,
        wetADC: 360
      }
    ];
  }

  /**
   * Generates a realistic reading for a given plot state
   */
  generateReading(plotState) {
    this.stepCount++;

    // 1. Simulate Moisture Drift & Irrigation Cycles
    // Add small random noise (-0.2% to +0.2%)
    const noise = (Math.random() - 0.5) * 0.4;
    plotState.currentMoisture -= plotState.dryingRate + noise;

    // Trigger irrigation event if moisture drops below threshold
    let isIrrigationEvent = false;
    if (plotState.currentMoisture <= plotState.irrigationThreshold) {
      plotState.currentMoisture += plotState.irrigationBoost;
      isIrrigationEvent = true;
    }

    // Clamp between 5% and 95%
    plotState.currentMoisture = Math.max(5.0, Math.min(95.0, plotState.currentMoisture));
    const roundedMoisture = Math.round(plotState.currentMoisture * 10) / 10;

    // 2. Reverse calculate realistic ADC raw value from moisture %
    // moisture% = ((dryADC - rawValue) / (dryADC - wetADC)) * 100
    const rawADC = Math.round(
      plotState.dryADC - (roundedMoisture / 100.0) * (plotState.dryADC - plotState.wetADC)
    );

    // 3. Diurnal Temperature Curve
    // Cooler early morning (~18°C), peaking mid-afternoon (~32°C)
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60.0;
    const tempBase = 25.0 + 7.0 * Math.sin(((hour - 9) / 24.0) * 2 * Math.PI);
    const tempWithNoise = Math.round((tempBase + (Math.random() - 0.5) * 1.0) * 10) / 10;

    // 4. Construct unique ingestion UUID for idempotency
    const ingestionId = `SIM_${plotState.deviceId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    return {
      deviceId: plotState.deviceId,
      plotId: plotState.plotId,
      rawValue: rawADC,
      moisturePercentage: roundedMoisture,
      temperature: tempWithNoise,
      timestamp: now.toISOString(),
      source: 'simulation',
      ingestionId,
      metadata: {
        simulatedSoilType: plotState.soilType,
        isIrrigationEvent,
        simulationStep: this.stepCount
      }
    };
  }

  /**
   * Dispatches a single tick across all active simulated plots
   */
  async tick() {
    for (const plotState of this.plots) {
      const payload = this.generateReading(plotState);
      this.sendPayload(payload);
    }
  }

  /**
   * HTTP POST to Express ingestion API
   */
  sendPayload(payload) {
    const postData = JSON.stringify(payload);

    const options = {
      hostname: this.apiHost,
      port: this.apiPort,
      path: this.apiPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Ingested successfully
        } else {
          console.warn(`[Simulator Ingestion Notice] Status ${res.statusCode}:`, body);
        }
      });
    });

    req.on('error', err => {
      console.warn(`[Simulator Notice] Waiting for server on port ${this.apiPort}... (${err.message})`);
    });

    req.write(postData);
    req.end();
  }

  /**
   * Start periodic simulation
   */
  start() {
    console.log(`[SoilSense Simulator] Started generating simulated readings across ${this.plots.length} plots every ${this.intervalMs}ms.`);
    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);
  }

  /**
   * Stop simulator
   */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[SoilSense Simulator] Stopped.');
    }
  }
}

// Standalone execution if run via CLI
if (require.main === module) {
  const sim = new SoilSenseSimulator();
  sim.start();
}

module.exports = SoilSenseSimulator;
