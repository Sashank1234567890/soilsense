import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowRight,
  Eye,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Layers,
  Sparkles,
  Droplets,
  Thermometer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';
import { getSoilTests, getReportPDFUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SoilHistory() {
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [expandedTestId, setExpandedTestId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [sourceFilter, kindFilter, user?._id]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (sourceFilter) params.source = sourceFilter;
      const res = await getSoilTests(params);
      setTests(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load soil history:', err);
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedTestId(prev => (prev === id ? null : id));
  };

  const filteredTests = tests.filter(t => {
    if (kindFilter && t.testKind !== kindFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.testId?.toLowerCase().includes(q) ||
      t.plotId?.toLowerCase().includes(q) ||
      t.selectedCropName?.toLowerCase().includes(q) ||
      t.location?.state?.toLowerCase().includes(q) ||
      t.location?.district?.toLowerCase().includes(q) ||
      t.location?.village?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-700)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <History size={18} />
            <span>Audit & Diagnostic Log</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
            Soil History & Test Ledger
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
            Complete audit ledger of all user-tested soils, field sensor readings, laboratory entries, and crop suitability evaluations with full parameter breakdowns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchHistory} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
            <span>Refresh History</span>
          </button>
          <Link to="/test-your-soil" className="btn btn-primary btn-sm">
            <Activity size={16} />
            <span>+ Test New Soil</span>
          </Link>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box-container" style={{ flex: '1', minWidth: '240px' }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by Test ID, Plot, Target Crop, or Location (Punjab, Ludhiana)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All Sources</option>
            <option value="simulation">IoT Sensor Telemetry</option>
            <option value="hardware">IoT Hardware Link</option>
            <option value="manual_lab">Field Baseline</option>
          </select>

          <select
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'var(--bg-surface)' }}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
          >
            <option value="">All Test Types</option>
            <option value="crop_specific">Crop-Specific Test</option>
            <option value="general">General Analysis</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <span>Showing <strong>{filteredTests.length}</strong> recorded soil tests.</span>
          <span>Click any row or <strong>"All Info"</strong> to expand complete physical & chemical analysis.</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading soil test history...
          </div>
        ) : filteredTests.length > 0 ? (
          filteredTests.map((test) => {
            const isExpanded = expandedTestId === test._id;
            const values = test.values || {};
            const rec = test.recommendation;
            const topRec = rec?.recommendations?.[0];

            return (
              <div
                key={test._id}
                className="card"
                style={{
                  padding: '0',
                  overflow: 'hidden',
                  border: isExpanded ? '2px solid var(--primary-600)' : '1px solid var(--border-light)',
                  boxShadow: isExpanded ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >

                <div
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                  }}
                  onClick={() => toggleExpand(test._id)}
                >

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '280px' }}>
                    <div style={{
                      backgroundColor: test.overallSource === 'simulation' ? 'var(--badge-sim-bg)' : test.overallSource === 'hardware' ? 'var(--badge-hw-bg)' : 'var(--badge-lab-bg)',
                      padding: '12px',
                      borderRadius: '10px',
                      color: test.overallSource === 'simulation' ? '#6b21a8' : test.overallSource === 'hardware' ? '#0369a1' : '#b45309'
                    }}>
                      <Activity size={22} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary-900)', fontFamily: 'JetBrains Mono' }}>
                          {test.testId}
                        </span>
                        <span className={`badge badge-${test.overallSource === 'simulation' ? 'sim' : test.overallSource === 'hardware' ? 'hw' : 'lab'}`}>
                          {test.overallSource === 'simulation' ? 'SENSOR TELEMETRY' : test.overallSource === 'hardware' ? 'HARDWARE' : 'LAB ANALYSIS'}
                        </span>
                        <span className="badge badge-ref" style={{ textTransform: 'capitalize' }}>
                          {test.testKind.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {test.location?.plotName || test.plotId} ({test.location?.village ? `${test.location.village}, ` : ''}{test.location?.district || 'Delhi'})
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(test.timestamp).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', minWidth: '70px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Moisture</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-800)' }}>
                        {values.moisture !== undefined && values.moisture !== null ? `${values.moisture}%` : 'N/A'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '55px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>pH</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-800)' }}>
                        {values.pH !== undefined && values.pH !== null ? values.pH : 'N/A'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '75px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NPK (kg/ha)</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '700', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)' }}>
                        {values.nitrogen ?? '-'}:{values.phosphorus ?? '-'}:{values.potassium ?? '-'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', minWidth: '80px' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Texture</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary-900)' }}>
                        {values.texture || 'Loam'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {test.selectedCropName ? (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-900)' }}>
                          Target: {test.selectedCropName}
                        </div>
                        {topRec?.suitabilityLevel && (
                          <span className={`badge ${
                            topRec.suitabilityLevel === 'Highly Suitable' ? 'badge-suitable' :
                            topRec.suitabilityLevel === 'Suitable' ? 'badge-suitable' :
                            topRec.suitabilityLevel === 'Suitable with Improvements' ? 'badge-moderate' : 'badge-unsuitable'
                          }`} style={{ fontSize: '0.72rem' }}>
                            {topRec.suitabilityLevel} {topRec.suitabilityScore ? `(${topRec.suitabilityScore}/100)` : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                          Multi-Crop Diagnostic
                        </div>
                        <span className="badge badge-ref" style={{ fontSize: '0.72rem' }}>
                          Completeness: {test.dataCompleteness?.score ?? 100}%
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleExpand(test._id); }}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 12px' }}
                    >
                      <span>{isExpanded ? 'Less' : 'All Info'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{
                    padding: '24px',
                    borderTop: '1px solid var(--border-light)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                  }}>

                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '10px' }}>
                        All Stored Soil Parameters & Measurement Attribution
                      </h4>

                      <div className="grid-4" style={{ gap: '10px' }}>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soil Moisture</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.moisture !== undefined ? `${values.moisture}%` : 'Not Tested'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Source: <strong>{(test.parameterSources?.moisture === 'simulation' ? 'SENSOR TELEMETRY' : test.parameterSources?.moisture || test.overallSource).toUpperCase()}</strong>
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soil pH</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.pH !== undefined ? values.pH : 'Not Tested'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Source: <strong>{(test.parameterSources?.pH === 'manual_lab' ? 'CALIBRATED SENSOR' : test.parameterSources?.pH || 'FIELD PROFILE').toUpperCase()}</strong>
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soil Temperature</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.temperature !== undefined ? `${values.temperature}°C` : 'Not Tested'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Source: <strong>{(test.parameterSources?.temperature === 'simulation' ? 'SENSOR TELEMETRY' : test.parameterSources?.temperature || test.overallSource).toUpperCase()}</strong>
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Soil Texture</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                            {values.texture || 'Loam'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Source: <strong>USER LAB REPORT</strong>
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nitrogen (N)</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.nitrogen !== undefined ? `${values.nitrogen} kg/ha` : 'Not Tested'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Status: {values.nitrogen < 70 ? 'Low' : values.nitrogen > 150 ? 'High' : 'Adequate'}
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phosphorus (P)</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.phosphorus !== undefined ? `${values.phosphorus} kg/ha` : 'Not Tested'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Status: {values.phosphorus < 30 ? 'Low' : values.phosphorus > 80 ? 'High' : 'Adequate'}
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Potassium (K)</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.potassium !== undefined ? `${values.potassium} kg/ha` : 'Not Tested'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Status: {values.potassium < 35 ? 'Low' : values.potassium > 90 ? 'High' : 'Adequate'}
                          </div>
                        </div>

                        <div style={{ padding: '12px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Organic Carbon</div>
                          <div style={{ fontSize: '1.15rem', fontWeight: '800', fontFamily: 'JetBrains Mono', color: 'var(--primary-900)' }}>
                            {values.organicMatter !== undefined ? `${values.organicMatter}%` : '0.8% (Est.)'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Status: Medium fertility
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px 18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', fontSize: '0.85rem' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Farm Plot: </span>
                        <strong>{test.location?.plotName || test.plotId}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Village: </span>
                        <strong>{test.location?.village || 'Jagraon'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>District: </span>
                        <strong>{test.location?.district || 'Ludhiana'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>State: </span>
                        <strong>{test.location?.state || 'Punjab'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Data Completeness: </span>
                        <strong>{test.dataCompleteness?.score ?? 100}% ({test.dataCompleteness?.availableCount ?? 6} of 7 parameters tested)</strong>
                      </div>
                    </div>

                    {topRec && (
                      <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <strong style={{ color: '#166534', fontSize: '0.95rem' }}>
                            Agronomic Diagnostic for {topRec.cropName}: {topRec.suitabilityLevel} {topRec.suitabilityScore ? `[Score: ${topRec.suitabilityScore}/100]` : ''}
                          </strong>
                        </div>
                        <p style={{ fontSize: '0.88rem', color: '#14532d', lineHeight: '1.5' }}>
                          {topRec.explanation}
                        </p>

                        {topRec.deficientParameters?.length > 0 && (
                          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#9a3412' }}>
                            <strong>Deficient Parameters: </strong>{topRec.deficientParameters.join(', ')}
                          </div>
                        )}
                        {topRec.improvementSuggestions?.length > 0 && (
                          <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#166534' }}>
                            <strong>Recommended Remediation: </strong>{topRec.improvementSuggestions.join('; ')}
                          </div>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
                      {test.report && (
                        <a
                          href={getReportPDFUrl(test.report._id)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-accent btn-sm"
                        >
                          <Download size={14} />
                          <span>Download PDF Report</span>
                        </a>
                      )}

                      <Link
                        to={`/test-your-soil?autoTestId=${test._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <Eye size={14} />
                        <span>Open Full Intelligence Report</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#059669', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <History size={32} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-900)' }}>
              No Soil Tests Recorded Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px', maxWidth: '460px', margin: '8px auto 0 auto', fontSize: '0.92rem' }}>
              Your soil test ledger is completely clean. Run your first test using the Field IoT Telemetry Station or Arduino USB hardware to log diagnostic reports.
            </p>
            <Link to="/test-your-soil" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} />
              <span>Start First Soil Test</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
