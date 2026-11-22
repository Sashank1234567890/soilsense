import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Radio,
  Cpu,
  RotateCcw,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Battery,
  Wifi,
  Zap
} from 'lucide-react';
import { getDevices, getDeviceReadings, getAlerts, ingestSensorReading, getIoTStatus } from '../services/api';

export default function LiveMonitoring() {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInjecting, setIsInjecting] = useState(false);
  const [hardwareStatus, setHardwareStatus] = useState({ connected: false, mode: 'standby' });

  useEffect(() => {
    loadDevices();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      refreshData();
    }
  }, [selectedDevice]);

  const loadDevices = async () => {
    try {
      const res = await getDevices();
      setDevices(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedDevice(res.data.data[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load devices:', err);
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!selectedDevice) return;
    try {
      const [readingsRes, alertsRes, statusRes] = await Promise.all([
        getDeviceReadings(selectedDevice.deviceId, 25),
        getAlerts(),
        getIoTStatus()
      ]);

      if (statusRes.data) {
        setHardwareStatus(statusRes.data);
      }

      const formatted = (readingsRes.data.data || []).map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        moisture: r.moisturePercentage,
        temperature: r.temperature || 24,
        source: r.source
      }));
      setReadings(formatted);
      setAlerts(alertsRes.data.data || []);
    } catch (err) {
      console.error('Failed to refresh live telemetry:', err);
    }
  };

  const triggerLiveSimTick = async () => {
    if (!selectedDevice) return;
    setIsInjecting(true);
    try {
      const randomMoisture = Math.round((36 + Math.random() * 26) * 10) / 10;
      const rawADC = Math.round(820 - (randomMoisture / 100.0) * (820 - 350));
      const ingestionId = `LIVE_SIM_${Date.now()}`;

      await ingestSensorReading({
        deviceId: selectedDevice.deviceId,
        plotId: selectedDevice.plotId || 'PLOT_001',
        rawValue: rawADC,
        moisturePercentage: randomMoisture,
        temperature: Math.round((22 + Math.random() * 8) * 10) / 10,
        source: 'simulation',
        ingestionId
      });
      await refreshData();
      setIsInjecting(false);
    } catch (err) {
      console.error('Failed to inject tick:', err);
      setIsInjecting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#be185d', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <Radio size={18} />
            <span>Real-Time Sensor Telemetry Stream</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
            Live IoT Monitoring
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Continuous ingestion console displaying capacitive ADC data, calibrated moisture, and threshold alert triggers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={triggerLiveSimTick}
            disabled={isInjecting}
            className="btn btn-accent btn-sm"
          >
            <Zap size={14} />
            <span>{isInjecting ? 'Transmitting...' : 'Capture Sensor Reading'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {devices.map(dev => (
          <button
            key={dev._id}
            onClick={() => setSelectedDevice(dev)}
            className={`btn ${selectedDevice?.deviceId === dev.deviceId ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Radio size={14} />
            <span>{dev.name} ({dev.deviceId})</span>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: dev.status === 'active' ? '#4ade80' : '#ef4444'
            }}></span>
          </button>
        ))}
      </div>

      {selectedDevice && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card" style={{ borderTop: '4px solid #be185d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                    {selectedDevice.name}
                  </h2>
                  <span className={`badge badge-${hardwareStatus.connected ? 'hw' : 'sim'}`}>
                    {hardwareStatus.connected ? 'HARDWARE USB STREAM' : 'STANDBY MODE'}
                  </span>
                  <span className={`badge ${hardwareStatus.connected ? 'badge-suitable' : 'badge-lab'}`}>
                    {hardwareStatus.connected ? '● Physical Hardware Online' : '○ Standby (Awaiting USB Device)'}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Target: {selectedDevice.plotId} • Model: Arduino Uno R3 • Telemetry Pin: A0 (Moisture), A1 (Temp)
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Battery size={16} color={hardwareStatus.connected ? '#16a34a' : '#d97706'} />
                  <span>{hardwareStatus.connected ? 'USB Serial Active' : 'USB Awaiting Device'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={16} color={hardwareStatus.connected ? '#0284c7' : '#94a3b8'} />
                  <span>9600 Baud</span>
                </div>
              </div>
            </div>

            {!hardwareStatus.connected && (
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#92400e',
                fontSize: '0.86rem',
                marginTop: '16px'
              }}>
                <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Physical IoT Hardware Not Yet Connected:</strong> Plug your Arduino Uno sensor into the USB port to start streaming live soil telemetry. You can also click <strong>"Capture Sensor Reading"</strong> above to test the soil telemetry stream.
                </div>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '8px', marginTop: '16px', display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Dry Calibration (Air): </span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>{selectedDevice.calibration?.dryADC || 820} ADC</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Wet Calibration (Water): </span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>{selectedDevice.calibration?.wetADC || 350} ADC</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Serial Port: </span>
                <strong style={{ fontFamily: 'JetBrains Mono' }}>{selectedDevice.metadata?.port || '/dev/cu.usbmodem14101'}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 className="card-title">Live Volumetric Moisture Trend (%)</h3>
                <div className="card-subtitle">Real-time telemetry stream from calibrated A0 sensor</div>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Latest: <strong>{readings.length > 0 ? `${readings[readings.length - 1].moisture}%` : 'N/A'}</strong>
              </div>
            </div>

            <div style={{ width: '100%', height: '320px' }}>
              {readings.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readings} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="liveMoistGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#be185d" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#be185d" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(val) => [`${val}%`, 'Moisture']} />
                    <Area type="monotone" dataKey="moisture" stroke="#9d174d" strokeWidth={2.5} fillOpacity={1} fill="url(#liveMoistGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Awaiting readings from device stream...
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Threshold Alert Log & Health Diagnostics</h3>
            <div className="card-subtitle">Automatic triggers evaluated on ingestion</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {alerts.length > 0 ? (
                alerts.map(a => (
                  <div
                    key={a._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertTriangle size={18} color="#d97706" />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{a.type}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{a.message}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <div>{new Date(a.timestamp).toLocaleTimeString()}</div>
                      <div style={{ fontFamily: 'JetBrains Mono' }}>{a.deduplicationKey}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', padding: '16px' }}>
                  All hardware and telemetry channels healthy. No anomalies recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
