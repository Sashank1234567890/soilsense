import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Sprout,
  Activity,
  ArrowRight,
  Database,
  Radio,
  FileCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      <div className="hero-banner" style={{
        padding: '42px 38px',
        boxShadow: '0 12px 30px -8px rgba(6, 78, 59, 0.35)',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '820px' }}>
            <span style={{
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(6px)',
              padding: '5px 14px',
              borderRadius: '9999px',
              fontSize: '0.76rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#d1fae5',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 8px #4ade80' }}></span>
              NIT Delhi CSE • 3rd Sem DBMS Project (CSBB 204)
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '16px', lineHeight: '1.2', letterSpacing: '-0.03em', color: '#ffffff' }}>
              SoilSense: Precision Soil Health & Crop Intelligence Platform
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#e6fcf5', marginTop: '14px', lineHeight: '1.65', fontWeight: '400' }}>
              An agricultural intelligence platform connecting ICAR soil science benchmarks with real-time capacitive moisture telemetry and laboratory test data to deliver crop suitability scoring, nutrient deficiency diagnostics, and soil improvement recommendations.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', marginTop: '28px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <Link to="/test-your-soil" className="btn btn-accent btn-lg" style={{ fontWeight: '700', boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)' }}>
            <span>Test Soil Now</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/crop-to-soil" className="btn btn-secondary btn-lg" style={{ fontWeight: '700', backgroundColor: '#ffffff', color: '#064e3b', border: 'none' }}>
            <span>Explore Crop Requirements</span>
          </Link>
          <Link to="/soil-to-crop" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.45)', fontWeight: '700' }}>
            <span>Indian Soil Database</span>
          </Link>
        </div>

        <div style={{
          position: 'absolute',
          right: '-50px',
          bottom: '-50px',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52, 211, 153, 0.22) 0%, rgba(6, 78, 59, 0) 70%)',
          pointerEvents: 'none'
        }} />
      </div>

      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '8px' }}>
          Core System Modules
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Three specialized agricultural modules providing research-backed guidance and testing workflows.
        </p>

        <div className="grid-3">
          
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #40916c' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '8px', color: '#2e7d32' }}>
                  <Layers size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module 1</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Soil to Crop</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Explore major Indian soil types (Alluvial, Black, Red, etc.). Search by name, texture, and state distribution to view reference suitability tiers without triggering a soil test.
              </p>
            </div>
            <Link to="/soil-to-crop" className="btn btn-primary btn-sm" style={{ marginTop: '20px', alignSelf: 'flex-start' }}>
              <span>Search Soil Types</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #d97706' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', color: '#b45309' }}>
                  <Sprout size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module 2</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Crop to Soil</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Search crops and check ICAR agronomic requirements. Select any crop and test your soil against its exact thresholds to diagnose deficiencies and calculate compatibility.
              </p>
            </div>
            <Link to="/crop-to-soil" className="btn btn-accent btn-sm" style={{ marginTop: '20px', alignSelf: 'flex-start' }}>
              <span>Select & Test Crop</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #2563eb' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ backgroundColor: '#dbeafe', padding: '10px', borderRadius: '8px', color: '#1d4ed8' }}>
                  <Activity size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Module 3</div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Test Your Soil</h3>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Comprehensive soil analysis pipeline. Ingest sensor readings or lab entries to evaluate data completeness, rank suitability across all cataloged crops, and generate complete reports.
              </p>
            </div>
            <Link to="/test-your-soil" className="btn btn-primary btn-sm" style={{ marginTop: '20px', alignSelf: 'flex-start' }}>
              <span>Run Soil Analysis</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '8px' }}>
          Evaluation Workflows
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Four complete user journeys covering research, testing, analysis, and remediation.
        </p>

        <div className="grid-2">
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-800)', marginBottom: '4px' }}>
              1. Soil Knowledge Exploration
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Soil to Crop → Search <em>Black Soil</em> → View ICAR physical profile & typical pH → View suitable crops grouped by tier → Click a crop card to view its agronomic requirements.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-800)', marginBottom: '4px' }}>
              2. Target Crop Testing
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Crop to Soil → Search <em>Wheat</em> → Check requirements → Click <strong>"TEST MY SOIL FOR THIS CROP"</strong> → Enter field values → Stored in database → View parameter comparison table and soil improvement plan.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-800)', marginBottom: '4px' }}>
              3. Comprehensive Field Diagnostic
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Test Your Soil → Start New Soil Test → Enter or capture readings → Add plot location → Generates complete Soil Intelligence Report comparing against all crops in the database.
            </p>
          </div>

          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px' }}>
            <div style={{ fontWeight: '700', color: 'var(--primary-800)', marginBottom: '4px' }}>
              4. Incompatibility & Remediation
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Test <em>Rice</em> on dry sandy soil → System identifies moisture deficit → Shows <em>Not Recommended</em> → Recommends practical soil amendments and suggests suitable alternative crops like Mustard or Barley.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '16px' }}>
          Data Pipeline Architecture
        </h2>
        <div style={{
          backgroundColor: '#0f172a',
          color: '#38bdf8',
          padding: '20px',
          borderRadius: '10px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          overflowX: 'auto'
        }}>
          <div>[Capacitive Moisture Sensor (A0)] ──► [Arduino Uno MCU] ──► [USB Serial Bridge]</div>
          <div style={{ color: '#94a3b8' }}>                                                           │</div>
          <div style={{ color: '#94a3b8' }}>                                                           ▼ (POST /api/sensor/readings)</div>
          <div>[Calibrated Field Telemetry Node] ──────────────────────► [Express API & Data Validation]</div>
          <div style={{ color: '#94a3b8' }}>                                                           │</div>
          <div style={{ color: '#94a3b8' }}>                                                           ▼</div>
          <div style={{ color: '#4ade80' }}>┌────────────────────────────────────────────────────────────────────────┐</div>
          <div style={{ color: '#4ade80' }}>│ Enterprise Agronomic Intelligence Engine (Secure Real-Time Storage)    │</div>
          <div style={{ color: '#4ade80' }}>│ Real-time Telemetry • Soil Health Analytics • Instant Advisory Rules   │</div>
          <div style={{ color: '#4ade80' }}>└───────────────────────────────────┬────────────────────────────────────┘</div>
          <div style={{ color: '#94a3b8' }}>                                    ▼</div>
          <div>                    [React Single-Page Application]</div>
        </div>
      </div>
    </div>
  );
}
