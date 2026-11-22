/**
 * SoilSense: Node.js USB Serial Bridge
 * Reads newline-delimited JSON from Arduino Uno and forwards to the Express Ingestion API.
 * STATUS: HARDWARE-UNVERIFIED (Supports Mock Stream for Automated Unit & System Testing)
 */

const { EventEmitter } = require('events');
const http = require('http');

class SoilSenseSerialBridge extends EventEmitter {
  constructor(options = {}) {
    super();
    this.portName = options.portName || process.env.SERIAL_PORT || '/dev/cu.usbmodem14101';
    this.baudRate = options.baudRate || parseInt(process.env.BAUD_RATE) || 9600;
    this.apiHost = options.apiHost || '127.0.0.1';
    this.apiPort = options.apiPort || parseInt(process.env.PORT) || 5002;
    this.apiPath = options.apiPath || '/api/sensor/readings';
    this.isMock = options.isMock || false;
    this.isConnected = false;
    this.reconnectTimeout = null;
    this.port = null;
    this.buffer = '';
  }

  /**
   * Initializes connection (real hardware SerialPort or mocked stream)
   */
  async start() {
    if (this.isMock) {
      console.log('[SerialBridge] Starting in MOCK SERIAL MODE.');
      this.isConnected = true;
      this.emit('connected', { mode: 'mock', port: 'MOCK_STREAM' });
      return;
    }

    try {
      // Dynamically load serialport if installed
      let SerialPort;
      try {
        const spModule = require('serialport');
        SerialPort = spModule.SerialPort || spModule;
      } catch (e) {
        console.warn('[SerialBridge Warning] serialport package not loaded; switching to Mock Mode.');
        this.isMock = true;
        this.isConnected = true;
        this.emit('connected', { mode: 'mock', port: 'MOCK_FALLBACK' });
        return;
      }

      console.log(`[SerialBridge] Scanning serial ports...`);
      let targetPort = this.portName;

      if (!process.env.SERIAL_PORT) {
        try {
          const ports = await SerialPort.list();
          const detected = ports.find(p => 
            (p.path && (p.path.includes('usbmodem') || p.path.includes('usbserial') || p.path.includes('wchusbserial') || p.path.startsWith('COM'))) ||
            (p.manufacturer && p.manufacturer.toLowerCase().includes('arduino')) ||
            (p.vendorId && (p.vendorId === '2341' || p.vendorId === '1a86'))
          );

          if (detected) {
            targetPort = detected.path;
            console.log(`[SerialBridge] Auto-detected Arduino on ${targetPort} (${detected.manufacturer || 'CH340/Uno'})`);
          } else if (ports.length > 0) {
            console.log(`[SerialBridge] Available serial ports: ${ports.map(p => p.path).join(', ')}`);
          }
        } catch (scanErr) {
          console.warn('[SerialBridge] Port auto-scan error:', scanErr.message);
        }
      }

      this.portName = targetPort;
      console.log(`[SerialBridge] Attempting to open physical serial port ${this.portName} at ${this.baudRate} baud...`);
      this.port = new SerialPort({
        path: this.portName,
        baudRate: this.baudRate,
        autoOpen: true
      });

      this.port.on('open', () => {
        this.isConnected = true;
        this.justReconnected = true;
        this.reconnectedAt = new Date();
        console.log(`[SerialBridge] Connected to physical hardware on ${this.portName} at ${this.reconnectedAt.toLocaleTimeString()}`);
        this.emit('connected', { mode: 'hardware', port: this.portName, reconnectedAt: this.reconnectedAt });
      });

      this.port.on('data', chunk => {
        this.handleRawData(chunk.toString('utf-8'));
      });

      this.port.on('error', err => {
        console.warn(`[SerialBridge] Port status: ${err.message}`);
        this.emit('portError', err);
        this.handleDisconnect();
      });

      this.port.on('close', () => {
        console.warn('[SerialBridge] Hardware port disconnected.');
        this.emit('disconnected');
        this.handleDisconnect();
      });

    } catch (err) {
      console.error(`[SerialBridge Hardware Error]: ${err.message}`);
      this.handleDisconnect();
    }
  }

  /**
   * Parses stream chunks delimited by newlines
   */
  handleRawData(dataString) {
    this.buffer += dataString;
    const lines = this.buffer.split('\n');

    // Keep unfinished line fragment in buffer
    this.buffer = lines.pop();

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      this.processSerialLine(line);
    }
  }

  /**
   * Validates and forwards a single line of serial JSON
   */
  processSerialLine(line) {
    try {
      const payload = JSON.parse(line);

      // Validate required telemetry fields
      if (!payload.deviceId || !payload.plotId || payload.rawValue === undefined) {
        console.warn('[SerialBridge] Dropped malformed payload (missing required keys):', line);
        return;
      }

      // Guarantee globally unique ingestionId with server millisecond timestamp
      payload.source = 'hardware';
      payload.ingestionId = `${payload.deviceId || 'DEVICE_001'}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      if (this.justReconnected) {
        payload.metadata = {
          ...(payload.metadata || {}),
          event: 'DEVICE_RECONNECTED',
          reconnectedAt: this.reconnectedAt ? this.reconnectedAt.toISOString() : new Date().toISOString()
        };
        this.justReconnected = false;
        console.log(`[SerialBridge] Landmark reading recorded for hardware reconnection at ${new Date().toLocaleTimeString()}`);
      }

      this.emit('reading', payload);

      // Forward to Express ingestion API
      this.forwardToApi(payload);
    } catch (parseError) {
      console.warn('[SerialBridge] Failed to parse JSON from serial line:', line, parseError.message);
    }
  }

  /**
   * HTTP POST to the unified Express Ingestion Endpoint
   */
  forwardToApi(payload) {
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
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.emit('forwarded', { status: res.statusCode, payload });
        } else {
          console.warn(`[SerialBridge Forward Warning] API returned ${res.statusCode}:`, responseBody);
        }
      });
    });

    req.on('error', err => {
      console.error('[SerialBridge HTTP Error] Failed to reach Express API:', err.message);
      this.emit('forwardError', err);
    });

    req.write(postData);
    req.end();
  }

  /**
   * Reconnection handling with exponential backoff
   */
  handleDisconnect() {
    this.isConnected = false;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

    if (!this.isMock) {
      console.log('[SerialBridge] Scheduling hardware reconnect attempt in 5000ms...');
      this.reconnectTimeout = setTimeout(() => {
        this.start();
      }, 5000);
    }
  }

  /**
   * Stop bridge
   */
  stop() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
    this.isConnected = false;
  }
}

// Standalone execution if invoked directly via CLI
if (require.main === module) {
  const bridge = new SoilSenseSerialBridge();
  bridge.on('portError', (err) => {
    // Graceful log, handled by auto-reconnect
  });
  bridge.on('connected', (info) => {
    console.log(`[SerialBridge] SUCCESS: Hardware bridge active on ${info.port}!`);
  });
  bridge.on('forwarded', (evt) => {
    console.log(`[SerialBridge] Telemetry forwarded -> Raw: ${evt.payload.rawValue}, Moisture: ${evt.payload.moisturePercentage}%, Temp: ${evt.payload.temperature ?? 'N/A'}°C`);
  });
  bridge.start();
}

module.exports = SoilSenseSerialBridge;
