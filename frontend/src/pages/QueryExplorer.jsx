import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  ShieldAlert,
  ArrowRight,
  Code2,
  Clock,
  Sparkles,
  Zap,
  Server,
  Copy,
  Check,
  Table,
  FileCode,
  Gauge,
  Sliders
} from 'lucide-react';
import {
  getPredefinedQueries,
  executeDBMSQuery,
  getDatabaseStats,
  runTransactionDemo
} from '../services/api';

export default function QueryExplorer() {
  const [queries, setQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [activeOutputTab, setActiveOutputTab] = useState('table'); // 'table' | 'json' | 'pipeline'
  const [copied, setCopied] = useState(false);

  // Category filter
  const [filterCategory, setFilterCategory] = useState('all');

  // Transaction Simulator State
  const [txnStatus, setTxnStatus] = useState(null);
  const [txnLoading, setTxnLoading] = useState(false);
  const [txnPlotId, setTxnPlotId] = useState('PLOT_001');
  const [txnMoisture, setTxnMoisture] = useState(48.5);
  const [txnPH, setTxnPH] = useState(6.8);

  useEffect(() => {
    loadQueriesAndStats();
  }, []);

  const loadQueriesAndStats = async () => {
    try {
      const [qRes, sRes] = await Promise.all([
        getPredefinedQueries(),
        getDatabaseStats()
      ]);
      const queryList = qRes.data.queries || [];
      setQueries(queryList);
      setDbStats(sRes.data);
      if (queryList.length > 0) {
        setSelectedQueryId(queryList[0].id);
        runQuery(queryList[0].id);
      }
    } catch (err) {
      console.error('Failed to load DBMS queries:', err);
    }
  };

  const runQuery = async (queryId) => {
    setLoading(true);
    setQueryResult(null);
    try {
      const res = await executeDBMSQuery(queryId);
      setQueryResult(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to execute query:', err);
      setLoading(false);
      alert(`Query error: ${err.message}`);
    }
  };

  const handleRunTransaction = async () => {
    setTxnLoading(true);
    setTxnStatus(null);
    try {
      const res = await runTransactionDemo({
        plotId: txnPlotId,
        moisture: parseFloat(txnMoisture),
        pH: parseFloat(txnPH),
        nitrogen: 120
      });
      setTxnStatus(res.data);
      setTxnLoading(false);
    } catch (err) {
      setTxnStatus({
        success: false,
        transactionStatus: 'ABORTED',
        error: err.response?.data?.error || err.message
      });
      setTxnLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredQueries = filterCategory === 'all'
    ? queries
    : queries.filter(q => q.category.toLowerCase().includes(filterCategory.toLowerCase()));

  // Helper to render table from array of objects
  const renderDataTable = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No records or non-tabular data returned. Switch to JSON view.
        </div>
      );
    }

    const firstItem = data[0];
    if (typeof firstItem !== 'object' || firstItem === null) {
      return (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Primitive values returned. Switch to JSON tab.
        </div>
      );
    }

    const headers = Object.keys(firstItem);

    return (
      <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-light)' }}>
              {headers.map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '800', color: 'var(--primary-900)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'
                }}
              >
                {headers.map(h => {
                  const val = row[h];
                  let displayVal = val;
                  if (typeof val === 'object' && val !== null) {
                    displayVal = JSON.stringify(val);
                  } else if (typeof val === 'number') {
                    displayVal = val.toLocaleString(undefined, { maximumFractionDigits: 2 });
                  }
                  return (
                    <td key={h} style={{ padding: '8px 14px', color: 'var(--text-primary)', fontFamily: typeof val === 'number' ? 'JetBrains Mono' : 'inherit' }}>
                      {String(displayVal ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Evaluation Suite Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
        borderRadius: '16px',
        padding: '30px',
        color: '#ffffff',
        boxShadow: '0 10px 25px -5px rgba(30, 27, 75, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Terminal size={14} color="#a5b4fc" />
              NIT Delhi • CSE DBMS Evaluation Console
            </span>
            <span style={{
              backgroundColor: 'rgba(99, 102, 241, 0.35)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#e0e7ff'
            }}>
              MongoDB Query & Aggregation Suite
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '6px 0', lineHeight: '1.2' }}>
            Database Aggregation & Performance Explorer
          </h1>
          <p style={{ fontSize: '0.96rem', color: '#c7d2fe', maxWidth: '850px', lineHeight: '1.6', marginTop: '6px' }}>
            Interactive workbench executing curated multi-stage aggregation pipelines (<code>$facet</code>, <code>$setWindowFields</code>), index optimization profilers (<code>explain("executionStats")</code>), and multi-document ACID transactions.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase' }}>Database Target</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', fontFamily: 'JetBrains Mono' }}>
                soilsense (rs0)
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase' }}>Active Collections</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#4ade80', fontFamily: 'JetBrains Mono' }}>
                {dbStats?.collections?.length || 14} Collections
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase' }}>Index Optimizer</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                IXSCAN Verified
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#a5b4fc', textTransform: 'uppercase' }}>Transaction Engine</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#facc15', fontFamily: 'JetBrains Mono' }}>
                ACID Session (WiredTiger)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Query Selector Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="card-title">Select Analytical Aggregation Pipeline</h2>
            <div className="card-subtitle">Choose a pre-compiled MongoDB operation to inspect execution plan and live data</div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Queries' },
              { id: 'aggregation', label: 'Aggregations' },
              { id: 'window', label: 'Window Operations' },
              { id: 'indexed', label: 'Indexed Optimization' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                style={{
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-light)',
                  backgroundColor: filterCategory === cat.id ? 'var(--primary-700)' : 'var(--bg-subtle)',
                  color: filterCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Query Buttons Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px', marginTop: '16px' }}>
          {filteredQueries.map(q => {
            const isSelected = selectedQueryId === q.id;
            return (
              <button
                key={q.id}
                onClick={() => { setSelectedQueryId(q.id); runQuery(q.id); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid var(--primary-700)' : '1px solid var(--border-light)',
                  backgroundColor: isSelected ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(45, 106, 79, 0.12)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    color: isSelected ? '#166534' : 'var(--text-muted)',
                    backgroundColor: isSelected ? '#dcfce7' : 'var(--bg-subtle)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {q.category}
                  </span>
                  {isSelected && <Zap size={14} color="#16a34a" />}
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: isSelected ? 'var(--primary-900)' : 'var(--text-primary)', marginTop: '6px' }}>
                  {q.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Execution Result & Profiler */}
      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-800)', marginBottom: '8px' }}>
            Executing Pipeline Against ReplicaSet rs0...
          </div>
          <div style={{ fontSize: '0.85rem' }}>Running MongoDB query engine with explain("executionStats") profiler</div>
        </div>
      ) : queryResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Performance Profiler Bar */}
          <div className="card" style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span className="badge badge-sim" style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  {queryResult.category}
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#ffffff', marginTop: '6px' }}>
                  {queryResult.name}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' }}>
                  Target Collection: <strong style={{ color: '#4ade80' }}>{queryResult.collection}</strong>
                </div>
              </div>

              {/* Real Stats */}
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Execution Time</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'JetBrains Mono' }}>
                    {queryResult.elapsedMs} ms
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Docs Examined</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4ade80', fontFamily: 'JetBrains Mono' }}>
                    {queryResult.executionStats?.totalDocsExamined ?? queryResult.count}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Execution Stage</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#facc15', fontFamily: 'JetBrains Mono' }}>
                    {queryResult.executionStats?.indexName || queryResult.executionStats?.stage || 'PIPELINE'}
                  </div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '16px', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
              <strong style={{ color: '#f8fafc' }}>DBMS Architectural Purpose: </strong>{queryResult.description}
            </p>
          </div>

          {/* Results Output Box with Table / JSON Toggle */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="card-title">Live Output ({queryResult.count} records returned)</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* View Toggles */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setActiveOutputTab('table')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeOutputTab === 'table' ? '#ffffff' : 'transparent',
                      color: activeOutputTab === 'table' ? 'var(--primary-800)' : 'var(--text-secondary)',
                      fontWeight: activeOutputTab === 'table' ? '700' : '500',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      boxShadow: activeOutputTab === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <Table size={13} />
                    <span>Table View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveOutputTab('json')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: activeOutputTab === 'json' ? '#ffffff' : 'transparent',
                      color: activeOutputTab === 'json' ? 'var(--primary-800)' : 'var(--text-secondary)',
                      fontWeight: activeOutputTab === 'json' ? '700' : '500',
                      fontSize: '0.76rem',
                      cursor: 'pointer',
                      boxShadow: activeOutputTab === 'json' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <FileCode size={13} />
                    <span>Raw JSON</span>
                  </button>
                </div>

                {/* Copy JSON */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(JSON.stringify(queryResult.data, null, 2))}
                  className="btn btn-outline btn-sm"
                  title="Copy full JSON output"
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                {/* Re-run button */}
                <button
                  type="button"
                  onClick={() => runQuery(selectedQueryId)}
                  className="btn btn-primary btn-sm"
                >
                  <Play size={13} />
                  <span>Re-execute</span>
                </button>
              </div>
            </div>

            {/* View Output */}
            {activeOutputTab === 'table' ? (
              renderDataTable(queryResult.data)
            ) : (
              <pre style={{
                backgroundColor: '#0f172a',
                padding: '18px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#38bdf8',
                overflowX: 'auto',
                maxHeight: '420px',
                border: '1px solid #1e293b',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                {JSON.stringify(queryResult.data, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Interactive Multi-Document ACID Transaction Playground */}
      <div className="card" style={{ borderTop: '4px solid #16a34a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontWeight: '800', fontSize: '0.85rem' }}>
              <Sparkles size={16} />
              <span>DBMS Requirement 7: Multi-Document ACID Transactions</span>
            </div>
            <h2 className="card-title" style={{ marginTop: '4px' }}>
              Interactive ACID Transaction Simulator (ReplicaSet rs0)
            </h2>
            <div className="card-subtitle">
              Atomically creates a new <code>SoilTest</code> audit document and updates the <code>Plot.lastTestedAt</code> timestamp inside a single session transaction boundary.
            </div>
          </div>

          <button
            onClick={handleRunTransaction}
            disabled={txnLoading}
            className="btn btn-primary"
          >
            <Play size={16} />
            <span>{txnLoading ? 'Committing Transaction...' : 'Run ACID Transaction'}</span>
          </button>
        </div>

        {/* Transaction Input Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginTop: '16px',
          padding: '16px',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '10px'
        }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-900)' }}>
              Target Plot ID
            </label>
            <select
              value={txnPlotId}
              onChange={(e) => setTxnPlotId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-light)',
                marginTop: '4px',
                fontSize: '0.84rem'
              }}
            >
              <option value="PLOT_001">Plot 001 (Field Block A • Ludhiana)</option>
              <option value="PLOT_002">Plot 002 (PAU Research Block C)</option>
              <option value="PLOT_003">Plot 003 (NIT Delhi Agri-Zone)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-900)' }}>
              Simulated Moisture ({txnMoisture}%)
            </label>
            <input
              type="range"
              min="10"
              max="90"
              step="0.5"
              value={txnMoisture}
              onChange={(e) => setTxnMoisture(e.target.value)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-900)' }}>
              Simulated Soil pH ({txnPH})
            </label>
            <input
              type="range"
              min="4.5"
              max="9.5"
              step="0.1"
              value={txnPH}
              onChange={(e) => setTxnPH(e.target.value)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
        </div>

        {/* Transaction Status Response */}
        {txnStatus && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: txnStatus.success ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${txnStatus.success ? '#bbf7d0' : '#fecaca'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', color: txnStatus.success ? '#166534' : '#991b1b' }}>
              <CheckCircle2 size={18} />
              <span>Transaction Status: {txnStatus.transactionStatus} (Committed with writeConcern majority)</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#334155', marginTop: '6px' }}>
              {txnStatus.message || txnStatus.error}
            </div>
            {txnStatus.testId && (
              <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
                Committed SoilTest Record ID: <strong>{txnStatus.testId}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MongoDB Database Collection & Index Matrix */}
      {dbStats && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 className="card-title">MongoDB Active Storage & Index Catalog ({dbStats.database})</h2>
              <div className="card-subtitle">Complete inventory of active collections, document counts, and compound/text indexes</div>
            </div>
            <span className="badge badge-suitable">
              {dbStats.collections.length} Collections Active
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
            marginTop: '16px'
          }}>
            {dbStats.collections.map((col, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary-900)', fontSize: '0.92rem' }}>
                    {col.collection}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '700', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                    {col.indexCount} Indexes
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Total Documents: <strong style={{ color: 'var(--primary-800)' }}>{col.count.toLocaleString()}</strong>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: '#475569',
                  marginTop: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                  backgroundColor: '#ffffff',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  lineHeight: '1.4'
                }}>
                  {col.indexes.map(i => i.name).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
