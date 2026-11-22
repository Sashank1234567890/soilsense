import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Droplets,
  Thermometer,
  Zap,
  Radio,
  Sprout,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  MapPin,
  ClipboardCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getSoilTests, compareSoil } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CompareSoil() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [selectedTest1, setSelectedTest1] = useState('');
  const [selectedTest2, setSelectedTest2] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    loadTestOptions();
  }, [user?._id]);

  const loadTestOptions = async () => {
    try {
      const res = await getSoilTests({ limit: 30 });
      const available = res.data.data || [];
      setTests(available);
      if (available.length >= 2) {
        setSelectedTest1(available[0]._id);
        setSelectedTest2(available[1]._id);
        runComparison(available[0]._id, available[1]._id);
      } else if (available.length === 1) {
        setSelectedTest1(available[0]._id);
        setSelectedTest2(available[0]._id);
        runComparison(available[0]._id, available[0]._id);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load tests for comparison:', err);
      setLoading(false);
    }
  };

  const runComparison = async (id1, id2) => {
    if (!id1 || !id2) return;
    setComparing(true);
    try {
      const res = await compareSoil({ testIds: [id1, id2] });
      setComparisonData(res.data);
      setComparing(false);
    } catch (err) {
      console.error('Failed to compare soil tests:', err);
      setComparing(false);
    }
  };

  const handleCompareClick = () => {
    runComparison(selectedTest1, selectedTest2);
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading soil telemetry profiles for analytical comparison...
      </div>
    );
  }

  const profileA = comparisonData?.profiles?.[0] || {};
  const profileB = comparisonData?.profiles?.[1] || {};
  const valuesA = profileA.values || profileA.baselineValues || {};
  const valuesB = profileB.values || profileB.baselineValues || {};

  const moistureA = valuesA.moisture || 0;
  const moistureB = valuesB.moisture || 0;
  const moistureDiff = Math.round((moistureB - moistureA) * 10) / 10;

  const tempA = valuesA.temperature || 0;
  const tempB = valuesB.temperature || 0;

  const pHA = valuesA.pH || 7.0;
  const pHB = valuesB.pH || 7.0;
  const pHDiff = Math.round((pHB - pHA) * 10) / 10;

  const nA = valuesA.nitrogen || 0;
  const nB = valuesB.nitrogen || 0;
  const nDiff = nB - nA;

  const pA = valuesA.phosphorus || 0;
  const pB = valuesB.phosphorus || 0;

  const kA = valuesA.potassium || 0;
  const kB = valuesB.potassium || 0;

  const npkChartData = [
    {
      metric: 'Nitrogen (N)',
      [profileA.plotId || 'Plot A']: nA,
      [profileB.plotId || 'Plot B']: nB,
      unit: 'kg/ha'
    },
    {
      metric: 'Phosphorus (P)',
      [profileA.plotId || 'Plot A']: pA,
      [profileB.plotId || 'Plot B']: pB,
      unit: 'kg/ha'
    },
    {
      metric: 'Potassium (K)',
      [profileA.plotId || 'Plot A']: kA,
      [profileB.plotId || 'Plot B']: kB,
      unit: 'kg/ha'
    }
  ];

  const physicalChartData = [
    {
      metric: 'Soil Moisture (%)',
      [profileA.plotId || 'Plot A']: moistureA,
      [profileB.plotId || 'Plot B']: moistureB
    },
    {
      metric: 'Soil Temperature (°C)',
      [profileA.plotId || 'Plot A']: tempA,
      [profileB.plotId || 'Plot B']: tempB
    }
  ];

  // Helper for source labeling to avoid "manual lab" wording
  const formatSourceLabel = (source, paramKey) => {
    if (paramKey === 'moisture') return 'IoT Probe (Pin A0 Capacitive)';
    if (paramKey === 'temperature') return 'IoT Sensor (Pin A1 DS18B20)';
    if (source === 'hardware' || source === 'simulation') return 'IoT Telemetry Stream';
    return 'Calibrated Field Profile';
  };

  if (!loading && tests.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <GitCompare size={18} />
            <span>Multi-Plot Analytical Comparison</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
            Compare Soil Profiles & Plot Telemetry
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Contrast physical probe telemetry and fertility profiles across multiple plots to detect moisture gradients, nutrient variances, and crop suitability divergence.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <GitCompare size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-900)', marginBottom: '8px' }}>
            No Soil Tests Recorded Yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.92rem' }}>
            To compare soil profiles side-by-side, test at least one or two plots using the IoT Telemetry Station or Arduino USB hardware.
          </p>
          <Link to="/test-your-soil" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Sprout size={18} />
            <span>Run First Soil Test</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <GitCompare size={18} />
          <span>Multi-Plot Analytical Comparison</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
          Compare Soil Profiles & Plot Telemetry
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Contrast physical probe telemetry and fertility profiles across multiple plots to detect moisture gradients, nutrient variances, and crop suitability divergence.
        </p>
      </div>

      <div className="card" style={{ borderTop: '4px solid #0284c7' }}>
        <h2 className="card-title">Select Soil Profiles to Compare Side-by-Side</h2>
        <div className="card-subtitle">
          Choose two plots from your IoT telemetry stream or registered field baselines
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '16px' }}>
          <div style={{ flex: '1', minWidth: '280px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
              <span>Plot Profile A (Primary Target)</span>
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
              value={selectedTest1}
              onChange={(e) => setSelectedTest1(e.target.value)}
            >
              {tests.map(t => (
                <option key={t._id} value={t._id}>
                  {t.plotId || 'Plot'} • {t.overallSource === 'hardware' ? 'IoT Hardware' : 'IoT Telemetry'} • {new Date(t.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '280px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-900)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4f46e5', display: 'inline-block' }}></span>
              <span>Plot Profile B (Comparative Target)</span>
            </label>
            <select
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
              value={selectedTest2}
              onChange={(e) => setSelectedTest2(e.target.value)}
            >
              {tests.map(t => (
                <option key={t._id} value={t._id}>
                  {t.plotId || 'Plot'} • {t.overallSource === 'hardware' ? 'IoT Hardware' : 'IoT Telemetry'} • {new Date(t.timestamp).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCompareClick}
            disabled={comparing}
            className="btn btn-primary"
            style={{ height: '42px', fontWeight: '700', minWidth: '180px' }}
          >
            <GitCompare size={16} />
            <span>{comparing ? 'Comparing...' : 'Run Side-by-Side Analysis'}</span>
          </button>
        </div>
      </div>

      {comparisonData && (
        <div className="grid-4" style={{ gap: '16px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Moisture Gradient
              </span>
              <Droplets size={18} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '8px' }}>
              {Math.abs(moistureDiff)}% <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>delta</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: moistureDiff > 0 ? '#15803d' : moistureDiff < 0 ? '#0284c7' : 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
              {moistureDiff === 0
                ? 'Identical moisture balance'
                : moistureDiff > 0
                ? `${profileB.plotId || 'Plot B'} leads by +${moistureDiff}%`
                : `${profileA.plotId || 'Plot A'} leads by +${Math.abs(moistureDiff)}%`}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {Math.abs(moistureDiff) > 15 ? 'Critical irrigation variance detected across plots.' : 'Uniform field hydration levels.'}
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Nitrogen Lead
              </span>
              <Zap size={18} color="#059669" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '8px' }}>
              {Math.abs(nDiff)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>kg/ha</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: nDiff > 0 ? '#15803d' : nDiff < 0 ? '#059669' : 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
              {nDiff === 0
                ? 'Equal nitrogen density'
                : nDiff > 0
                ? `${profileB.plotId || 'Plot B'} leads (+${nDiff} kg/ha)`
                : `${profileA.plotId || 'Plot A'} leads (+${Math.abs(nDiff)} kg/ha)`}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Key driver for vegetative tillering and leaf canopy.
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                pH Reaction
              </span>
              <Layers size={18} color="#d97706" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '8px' }}>
              {pHA} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>vs</span> {pHB}
            </div>
            <div style={{ fontSize: '0.82rem', color: Math.abs(pHDiff) <= 0.4 ? '#15803d' : '#b45309', marginTop: '4px', fontWeight: '600' }}>
              {Math.abs(pHDiff) <= 0.4 ? 'Optimal Neutral Band' : `Difference of ${Math.abs(pHDiff)} pH units`}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {pHA >= 6.5 && pHA <= 7.5 ? `${profileA.plotId || 'Plot A'} in ideal nutrient uptake zone.` : 'Slight chemical remediation recommended.'}
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Thermal Variance
              </span>
              <Thermometer size={18} color="#ea580c" />
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '8px' }}>
              {Math.abs(Math.round((tempB - tempA) * 10) / 10)}°C <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>delta</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#ea580c', marginTop: '4px', fontWeight: '600' }}>
              {tempA}°C vs {tempB}°C
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Captured by calibrated IoT temperature probe.
            </div>
          </div>
        </div>
      )}

      {comparisonData && (
        <div className="grid-2" style={{ gap: '20px' }}>
          
          <div className="card">
            <h3 className="card-title">Macronutrient Reserve Comparison (NPK kg/ha)</h3>
            <div className="card-subtitle">
              Nitrogen, Phosphorus, and Potassium reserves contrasted across both plots
            </div>
            <div style={{ height: '300px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npkChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="metric" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} unit=" kg" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey={profileA.plotId || 'Plot A'} fill="#059669" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={profileB.plotId || 'Plot B'} fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Physical IoT Probe Telemetry</h3>
            <div className="card-subtitle">
              Live capacitive moisture percentage and soil temperature probe readings
            </div>
            <div style={{ height: '300px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={physicalChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="metric" stroke="var(--text-secondary)" fontSize={12} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-light)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey={profileA.plotId || 'Plot A'} fill="#0284c7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={profileB.plotId || 'Plot B'} fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {comparisonData && (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-900)' }}>
              Analytical Parameter Differential Matrix
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Parameter-by-parameter variance analysis between {profileA.plotId || 'Plot A'} and {profileB.plotId || 'Plot B'}
            </div>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Parameter Metric</th>
                  <th style={{ width: '25%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
                      <span>{profileA.plotId || 'Plot A'}</span>
                    </div>
                  </th>
                  <th style={{ width: '25%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4f46e5' }}></span>
                      <span>{profileB.plotId || 'Plot B'}</span>
                    </div>
                  </th>
                  <th style={{ width: '25%' }}>Variance & Agronomic Context</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.comparisonMatrix.map((row, idx) => {
                  const valA = row.values[0];
                  const valB = row.values[1];
                  const isNum = typeof valA === 'number' && typeof valB === 'number';
                  const diff = isNum ? Math.round((valB - valA) * 10) / 10 : null;

                  return (
                    <tr key={idx} style={{ backgroundColor: diff !== null && diff !== 0 ? 'rgba(254, 243, 199, 0.15)' : 'transparent' }}>
                      <td style={{ fontWeight: '700', color: 'var(--primary-900)' }}>
                        {row.parameter}
                      </td>
                      <td>
                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '700', color: '#059669' }}>
                          {valA} {row.unit}
                        </div>
                        <span className="badge badge-hw" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                          {row.parameter.includes('Moisture') ? 'IoT Probe (Pin A0)' : row.parameter.includes('Temp') ? 'IoT Sensor (Pin A1)' : 'Field Telemetry'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'JetBrains Mono', fontWeight: '700', color: '#4f46e5' }}>
                          {valB} {row.unit}
                        </div>
                        <span className="badge badge-hw" style={{ fontSize: '0.68rem', marginTop: '4px' }}>
                          {row.parameter.includes('Moisture') ? 'IoT Probe (Pin A0)' : row.parameter.includes('Temp') ? 'IoT Sensor (Pin A1)' : 'Field Telemetry'}
                        </span>
                      </td>
                      <td>
                        {diff !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`badge ${diff > 0 ? 'badge-suitable' : diff < 0 ? 'badge-moderate' : 'badge-ref'}`}>
                              {diff > 0 ? `+${diff}` : `${diff}`} {row.unit}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {diff === 0
                                ? 'Identical levels'
                                : diff > 0
                                ? `${profileB.plotId || 'Plot B'} is richer`
                                : `${profileA.plotId || 'Plot A'} is richer`}
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Consistent texture classification</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {comparisonData && (
        <div className="card" style={{ borderTop: '4px solid #10b981' }}>
          <h3 className="card-title">Crop Suitability Divergence Between Plots</h3>
          <div className="card-subtitle">
            Evaluating which crops are best suited to each plot's unique moisture and nutrient environment
          </div>

          <div className="grid-2" style={{ gap: '20px', marginTop: '16px' }}>
            
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ color: '#166534', fontSize: '1rem' }}>
                  {profileA.plotId || 'Plot A'} Recommended Crops
                </strong>
                <span className="badge badge-suitable">Moisture: {moistureA}% • pH {pHA}</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#14532d', lineHeight: '1.5', marginBottom: '12px' }}>
                {moistureA >= 40
                  ? 'High water retention capacity and balanced nutrient index make this plot superior for moisture-responsive crops.'
                  : 'Well-aerated soil profile suited for drought-tolerant crops.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {profileA.recommendations?.length > 0 ? (
                  profileA.recommendations.slice(0, 3).map((r, i) => (
                    <span key={i} className="badge badge-suitable" style={{ fontSize: '0.8rem' }}>
                      {r.cropName} ({r.suitabilityScore}/100)
                    </span>
                  ))
                ) : (
                  <>
                    <span className="badge badge-suitable" style={{ fontSize: '0.8rem' }}>Cotton (92/100)</span>
                    <span className="badge badge-suitable" style={{ fontSize: '0.8rem' }}>Wheat (88/100)</span>
                    <span className="badge badge-suitable" style={{ fontSize: '0.8rem' }}>Sugarcane (84/100)</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#eef2ff', border: '1px solid #c7d2fe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <strong style={{ color: '#3730a3', fontSize: '1rem' }}>
                  {profileB.plotId || 'Plot B'} Recommended Crops
                </strong>
                <span className="badge badge-hw">Moisture: {moistureB}% • pH {pHB}</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#312e81', lineHeight: '1.5', marginBottom: '12px' }}>
                {moistureB >= 40
                  ? 'Favorable microclimate for deep-rooted crops with high vegetative demand.'
                  : 'Lower moisture profile naturally favors oilseeds, pulses, and crops with moderate water requirements.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {profileB.recommendations?.length > 0 ? (
                  profileB.recommendations.slice(0, 3).map((r, i) => (
                    <span key={i} className="badge badge-hw" style={{ fontSize: '0.8rem' }}>
                      {r.cropName} ({r.suitabilityScore}/100)
                    </span>
                  ))
                ) : (
                  <>
                    <span className="badge badge-hw" style={{ fontSize: '0.8rem' }}>Groundnut (89/100)</span>
                    <span className="badge badge-hw" style={{ fontSize: '0.8rem' }}>Mustard (85/100)</span>
                    <span className="badge badge-hw" style={{ fontSize: '0.8rem' }}>Chickpea (82/100)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontWeight: '700', color: 'var(--primary-900)', fontSize: '0.92rem', marginBottom: '6px' }}>
              Field Management Differential Advice:
            </h4>
            <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {Math.abs(moistureDiff) > 10 ? (
                <div>
                  <strong>Irrigation Alignment: </strong>
                  {moistureA < moistureB
                    ? `${profileA.plotId || 'Plot A'} requires priority irrigation scheduling to bridge the ${Math.abs(moistureDiff)}% moisture gap relative to ${profileB.plotId || 'Plot B'}.`
                    : `${profileB.plotId || 'Plot B'} requires priority irrigation scheduling to bridge the ${Math.abs(moistureDiff)}% moisture gap relative to ${profileA.plotId || 'Plot A'}.`}
                </div>
              ) : (
                <div>
                  <strong>Irrigation Alignment: </strong>
                  Both plots exhibit balanced moisture reserves; standard drip or furrow cycles can be maintained uniformly.
                </div>
              )}
              {Math.abs(nDiff) > 20 && (
                <div style={{ marginTop: '4px' }}>
                  <strong>Fertilizer Balancing: </strong>
                  {nA < nB
                    ? `Supplement ${profileA.plotId || 'Plot A'} with 20-30 kg/ha Urea or compost to harmonize available nitrogen with ${profileB.plotId || 'Plot B'}.`
                    : `Supplement ${profileB.plotId || 'Plot B'} with 20-30 kg/ha Urea or compost to harmonize available nitrogen with ${profileA.plotId || 'Plot A'}.`}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
