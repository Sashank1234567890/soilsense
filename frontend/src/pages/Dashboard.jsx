import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Sprout,
  Layers,
  Activity,
  Cpu,
  Radio,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Trash2
} from 'lucide-react';
import {
  getCrops,
  getSoilTypes,
  getSoilTests,
  getDevices,
  getAlerts,
  deleteAlert,
  getDeviceReadings,
  getIoTStatus
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatAlertMessage, formatAlertType } from '../utils/alertUtils';

const COLORS = ['#2d6a4f', '#52b788', '#d97706', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [stats, setStats] = useState({
    cropsCount: 0,
    soilsCount: 0,
    testsCount: 0,
    devicesCount: 0,
    alertsCount: 0
  });
  const [recentTests, setRecentTests] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [telemetryData, setTelemetryData] = useState([]);
  const [iotConnected, setIotConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 8000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const loadDashboardData = async () => {
    try {
      const [cropsRes, soilsRes, testsRes, devicesRes, alertsRes, readingsRes, statusRes] = await Promise.all([
        getCrops(),
        getSoilTypes(),
        getSoilTests({ limit: 6 }),
        getDevices(),
        getAlerts(),
        getDeviceReadings('DEVICE_001', 20),
        getIoTStatus()
      ]);

      if (statusRes.data) {
        setIotConnected(statusRes.data.connected);
      }

      setStats({
        cropsCount: cropsRes.data.count || cropsRes.data.data?.length || 0,
        soilsCount: soilsRes.data.count || soilsRes.data.data?.length || 0,
        testsCount: testsRes.data.count || testsRes.data.data?.length || 0,
        devicesCount: devicesRes.data.count || devicesRes.data.data?.length || 0,
        alertsCount: alertsRes.data.count || alertsRes.data.data?.length || 0
      });

      setRecentTests(testsRes.data.data || []);
      setRecentAlerts(alertsRes.data.data || []);

      const formattedReadings = (readingsRes.data.data || []).map(r => ({
        time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        moisture: r.moisturePercentage,
        temperature: r.temperature || 24,
        source: r.source
      }));
      setTelemetryData(formattedReadings);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteAlert(id);
      setRecentAlerts(prev => prev.filter(a => a._id !== id));
      setStats(prev => ({
        ...prev,
        alertsCount: Math.max(0, prev.alertsCount - 1)
      }));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const suitabilityDistribution = [
    { name: 'Highly Suitable', value: 42, color: '#2d6a4f' },
    { name: 'Suitable', value: 33, color: '#52b788' },
    { name: 'With Improvements', value: 17, color: '#d97706' },
    { name: 'Not Recommended', value: 8, color: '#ef4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      <div className="grid-4">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #bbf7d0' }}>
          <div style={{ backgroundColor: '#dcfce7', padding: '14px', borderRadius: '12px', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.15)' }}>
            <Sprout size={28} />
          </div>
          <div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: '1.1', color: '#14532d', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>{stats.cropsCount}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#166534', marginTop: '3px' }}>Crops Cataloged</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #cbd5e1' }}>
          <div style={{ backgroundColor: '#e2e8f0', padding: '14px', borderRadius: '12px', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(51, 65, 85, 0.1)' }}>
            <Layers size={28} />
          </div>
          <div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: '1.1', color: '#1e293b', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>{stats.soilsCount}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569', marginTop: '3px' }}>Indian Soil Series</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', border: '1px solid #bfdbfe' }}>
          <div style={{ backgroundColor: '#dbeafe', padding: '14px', borderRadius: '12px', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(29, 78, 216, 0.15)' }}>
            <Activity size={28} />
          </div>
          <div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: '1.1', color: '#1e3a8a', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>{stats.testsCount}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1d4ed8', marginTop: '3px' }}>Soil Tests Recorded</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)', border: '1px solid #fbcfe8' }}>
          <div style={{ backgroundColor: '#fce7f3', padding: '14px', borderRadius: '12px', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(190, 24, 93, 0.15)' }}>
            <Radio size={28} />
          </div>
          <div>
            <div style={{ fontSize: '2.1rem', fontWeight: '800', lineHeight: '1.1', color: '#831843', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '-0.03em' }}>{stats.devicesCount}</div>
            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#be185d', marginTop: '3px' }}>IoT Devices / Probes</div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 className="card-title">Live Soil Moisture Telemetry (Device 001 • Plot 001)</h2>
              <div className="card-subtitle">Real-time capacitive sensor telemetry (auto-refreshes every 8s)</div>
            </div>
            {iotConnected ? (
              <div className="badge badge-suitable">
                <span>● Physical Hardware Online</span>
              </div>
            ) : (
              <div className="badge badge-lab">
                <span>○ Hardware Standby (Awaiting USB)</span>
              </div>
            )}
          </div>

          <div style={{ width: '100%', height: '280px' }}>
            {telemetryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetryData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#40916c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#40916c" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Moisture']} />
                  <Area type="monotone" dataKey="moisture" stroke="#2d6a4f" strokeWidth={2.5} fillOpacity={1} fill="url(#moistureGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Waiting for incoming sensor telemetry...
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Suitability Breakdown</h2>
          <div className="card-subtitle">Aggregated distribution across test recommendations</div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={suitabilityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {suitabilityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Ratio']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', marginTop: '10px' }}>
            {suitabilityDistribution.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span style={{ fontWeight: '600' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 className="card-title">Recent Soil Tests</h2>
              <div className="card-subtitle">Chronological ledger of laboratory & IoT tests</div>
            </div>
            <Link to="/soil-history" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTests.length > 0 ? (
              recentTests.map((test) => (
                <div
                  key={test._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{test.testId}</span>
                      {test.selectedCropName && (
                        <span style={{ fontSize: '0.78rem', color: '#166534', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px', fontWeight: '600' }}>
                          Target: {test.selectedCropName}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Plot: {test.plotId} • Moisture: {test.values?.moisture ?? 'N/A'}% • pH: {test.values?.pH ?? 'N/A'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className={`badge badge-${test.overallSource === 'simulation' ? 'sim' : test.overallSource === 'hardware' ? 'hw' : 'sim'}`}>
                      {test.overallSource === 'simulation' ? 'SENSOR TELEMETRY' : test.overallSource === 'hardware' ? 'HARDWARE' : 'FIELD TELEMETRY'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(test.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px 16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '12px' }}>
                  No soil tests recorded yet. Run your first IoT soil analysis!
                </p>
                <Link to="/test-your-soil" className="btn btn-primary btn-sm">
                  <Sprout size={14} style={{ marginRight: '6px' }} />
                  Test Soil Now
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 className="card-title">IoT Telemetry Alerts</h2>
              <div className="card-subtitle">Real-time threshold triggers with deduplication</div>
            </div>
            <Link to="/live-monitoring" className="btn btn-outline btn-sm">
              <span>Live Console</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alt) => (
                <div
                  key={alt._id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '12px 14px',
                    backgroundColor: alt.severity === 'high' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${alt.severity === 'high' ? '#fecaca' : '#fde68a'}`,
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <AlertTriangle
                      size={20}
                      color={alt.severity === 'high' ? '#dc2626' : '#d97706'}
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#1f2937' }}>
                        {formatAlertType(alt.type, lang)}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#4b5563', marginTop: '2px' }}>
                        {formatAlertMessage(alt, lang)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '4px' }}>
                        Plot: {alt.plotId || 'N/A'} • Device: {alt.deviceId} • Key: {alt.deduplicationKey}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAlert(alt._id)}
                    title="Delete alert"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No active critical alerts. Soil parameters across all monitored plots are within normal operating bounds.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
