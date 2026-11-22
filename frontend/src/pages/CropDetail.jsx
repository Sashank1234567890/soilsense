import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  ArrowLeft,
  Droplets,
  Thermometer,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  Sparkles,
  ClipboardCheck,
  Send,
  Info,
  Radio
} from 'lucide-react';
import {
  getCropById,
  createSoilTest,
  evaluateCropSpecific,
  getSoilProfiles,
  getSoilTests,
  createImprovementPlan,
  getIoTStatus
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CropDetail() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  // Testing Flow State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testMode, setTestMode] = useState('manual_lab'); // 'manual_lab', 'hardware', 'existing_profile'
  const [iotConnected, setIotConnected] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');

  // Form Inputs for Soil Test
  const [testForm, setTestForm] = useState({
    plotId: 'PLOT_001',
    moisture: 48.0,
    temperature: 22.0,
    pH: 7.2,
    nitrogen: 110,
    phosphorus: 50,
    potassium: 45,
    texture: 'Loam'
  });

  // Test Evaluation Result
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [improvementPlan, setImprovementPlan] = useState(null);
  const [activeSoilTest, setActiveSoilTest] = useState(null);

  useEffect(() => {
    fetchCrop();
    fetchRegisteredProfiles();
    checkIoTStatus();
    const interval = setInterval(checkIoTStatus, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const checkIoTStatus = async () => {
    try {
      const res = await getIoTStatus();
      setIotConnected(res.data?.connected || false);
    } catch {
      setIotConnected(false);
    }
  };

  const fetchCrop = async () => {
    try {
      const res = await getCropById(id);
      setCrop(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load crop:', err);
      setLoading(false);
    }
  };

  const fetchRegisteredProfiles = async () => {
    try {
      const res = await getSoilProfiles();
      setProfiles(res.data.data || []);
      if (res.data.data?.length > 0) {
        setSelectedProfileId(res.data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTestForm(prev => ({
      ...prev,
      [name]: name === 'texture' || name === 'plotId' ? value : parseFloat(value) || 0
    }));
  };

  // Submit test and trigger crop-specific suitability evaluation
  const handleRunSuitabilityTest = async (e) => {
    if (e) e.preventDefault();

    if (testMode === 'hardware' && !iotConnected) {
      alert('Physical Arduino hardware is disconnected. You cannot run hardware test mode without USB hardware. Please select Field IoT Station.');
      return;
    }

    setEvaluating(true);
    setEvalResult(null);

    try {
      let finalValues = { ...testForm };
      let paramSources = {
        moisture: 'hardware',
        temperature: 'hardware',
        pH: 'reference',
        nitrogen: 'reference',
        phosphorus: 'reference',
        potassium: 'reference',
        texture: 'user_provided'
      };

      if (testMode === 'existing_profile') {
        const found = profiles.find(p => p._id === selectedProfileId);
        if (found && found.baselineValues) {
          finalValues = {
            moisture: found.baselineValues.moisture || 45,
            temperature: 24,
            pH: found.baselineValues.pH || 7.0,
            nitrogen: found.baselineValues.nitrogen || 90,
            phosphorus: found.baselineValues.phosphorus || 45,
            potassium: found.baselineValues.potassium || 50,
            texture: found.baselineValues.texture || 'Loam'
          };
          paramSources = {
            moisture: 'reference',
            temperature: 'reference',
            pH: 'reference',
            nitrogen: 'reference',
            phosphorus: 'reference',
            potassium: 'reference',
            texture: 'reference'
          };
        }
      }

      const { plotId: testPlotId, ...cleanValues } = finalValues;

      // 1. Create Soil Test in MongoDB with selectedCropId retained
      const testRes = await createSoilTest({
        plotId: testPlotId || testForm.plotId || 'PLOT_001',
        selectedCropId: crop._id,
        testKind: 'crop_specific',
        overallSource: 'hardware',
        values: cleanValues,
        parameterSources: paramSources,
        location: {
          state: 'Punjab',
          district: 'Ludhiana',
          village: 'Jagraon',
          plotName: testPlotId || testForm.plotId || 'PLOT_001'
        }
      });

      const savedTest = testRes.data.data;
      setActiveSoilTest(savedTest);

      // 2. Evaluate crop-specific suitability
      const evalRes = await evaluateCropSpecific(savedTest._id, crop._id);
      setEvalResult(evalRes.data.data);

      // 3. Generate crop-specific soil improvement plan
      const planRes = await createImprovementPlan({
        soilTestId: savedTest._id,
        targetCropId: crop._id
      });
      setImprovementPlan(planRes.data.data);

      setEvaluating(false);
      setIsTestModalOpen(false);

      // Scroll to result view
      setTimeout(() => {
        const elem = document.getElementById('suitability-results-section');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error('Failed to run crop suitability test:', err);
      setEvaluating(false);
      alert(`Test error: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading crop agronomic profile...
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Crop Not Found</h3>
        <Link to="/crop-to-soil" className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Crops Catalogue
        </Link>
      </div>
    );
  }

  const req = crop.idealRequirements || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Back button */}
      <div>
        <Link to="/crop-to-soil" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to Crop to Soil Explorer</span>
        </Link>
      </div>

      {/* Main Crop Banner */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {crop.image && (
            <div style={{ flex: '1', minWidth: '320px', maxHeight: '280px', overflow: 'hidden' }}>
              <img
                src={crop.image}
                alt={crop.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ flex: '2', minWidth: '320px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <span className="badge badge-ref" style={{ backgroundColor: '#fef3c7', color: '#92400e', marginBottom: '6px' }}>
                    {crop.category}
                  </span>
                  <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                    {crop.name}
                  </h1>
                  <div style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    {crop.scientificName}
                  </div>
                </div>

                {/* THE MOST IMPORTANT FEATURE BUTTON */}
                <button
                  onClick={() => setIsTestModalOpen(true)}
                  className="btn btn-accent btn-lg"
                  style={{
                    boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)',
                    transform: 'translateY(-2px)',
                    fontWeight: '700'
                  }}
                >
                  <Sparkles size={20} />
                  <span>TEST MY SOIL FOR THIS CROP</span>
                </button>
              </div>

              <p style={{ fontSize: '0.98rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>
                {crop.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Growing Season: </span>
                <strong>{(crop.growingSeasons || []).join(', ') || 'Rabi / Kharif'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Suitable Soils: </span>
                <strong>{(crop.suitableSoilTypes || []).join(', ')}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Major States: </span>
                <strong>{(crop.suitableRegions || []).slice(0, 3).join(', ')}...</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ideal Requirements Grid */}
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '16px' }}>
          Physiological & Soil Requirements
        </h2>

        <div className="grid-3">
          {/* pH & Moisture */}
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Droplets size={20} color="var(--primary-700)" />
              <span>pH & Moisture Bounds</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Soil pH Optimal: </span>
                <strong>{req.pH?.optimalMin ?? 'Data unavailable'} - {req.pH?.optimalMax ?? 'Data unavailable'}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Absolute limits: {req.pH?.min} - {req.pH?.max}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Soil Moisture Optimal: </span>
                <strong>{req.moisture?.optimalMin ?? 'Data unavailable'}% - {req.moisture?.optimalMax ?? 'Data unavailable'}%</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Tolerable range: {req.moisture?.min}% - {req.moisture?.max}%
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Irrigation Need: </span>
                <strong>{crop.irrigationRequirements || 'Moderate'}</strong>
              </div>
            </div>
          </div>

          {/* Temperature & Physical Textures */}
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer size={20} color="var(--primary-700)" />
              <span>Temperature & Texture</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Optimal Temp: </span>
                <strong>{req.temperature?.optimalMin ?? 'Data unavailable'}°C - {req.temperature?.optimalMax ?? 'Data unavailable'}°C</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Survival bounds: {req.temperature?.min}°C - {req.temperature?.max}°C
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Preferred Textures: </span>
                <strong>{(req.texture || []).join(', ') || 'Friable loamy soil'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Drainage Requirement: </span>
                <strong>{(req.drainage || []).join(', ') || 'Well-drained'}</strong>
              </div>
            </div>
          </div>

          {/* NPK Macronutrients */}
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--primary-700)" />
              <span>NPK Nutrient Guidelines</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', fontSize: '0.9rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Nitrogen (N): </span>
                <strong>{req.nitrogen?.optimalMin ?? 'Data unavailable'} - {req.nitrogen?.optimalMax ?? 'Data unavailable'} kg/ha</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Phosphorus (P): </span>
                <strong>{req.phosphorus?.optimalMin ?? 'Data unavailable'} - {req.phosphorus?.optimalMax ?? 'Data unavailable'} kg/ha</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Potassium (K): </span>
                <strong>{req.potassium?.optimalMin ?? 'Data unavailable'} - {req.potassium?.optimalMax ?? 'Data unavailable'} kg/ha</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Practice Notes */}
      <div className="grid-2">
        <div className="card">
          <h3 className="card-title">Fertilizer Considerations</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {crop.fertilizerConsiderations || 'Apply recommended basal NPK dosages based on official state agriculture department soil test results.'}
          </p>
        </div>
        <div className="card">
          <h3 className="card-title">Cultivation & Field Management</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {crop.cultivationInfo || 'Maintain proper seedbed preparation and appropriate spacing to ensure adequate aeration and root penetration.'}
          </p>
        </div>
      </div>

      {/* =========================================================================
          SUITABILITY TEST RESULTS SECTION (Rendered dynamically after running test)
          ========================================================================= */}
      {evalResult && (
        <div id="suitability-results-section" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '12px' }}>
          {/* Result Banner */}
          <div className="card" style={{
            borderLeft: `6px solid ${
              evalResult.overallSuitability === 'Suitable' ? '#15803d' :
              evalResult.overallSuitability === 'Moderately Suitable' ? '#d97706' : '#dc2626'
            }`,
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Crop-Specific Diagnostic Result • Test ID: {activeSoilTest?.testId}
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
                  Suitability for {crop.name}: {evalResult.recommendations[0]?.suitabilityLevel}
                </h2>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {evalResult.recommendations[0]?.explanation}
                </div>
              </div>

              {evalResult.suitabilityScore !== null ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  minWidth: '130px'
                }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary-800)', lineHeight: '1' }}>
                    {evalResult.suitabilityScore}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Score / 100
                  </div>
                </div>
              ) : (
                <div className="badge badge-moderate" style={{ padding: '8px 14px' }}>
                  Insufficient Data for Precise Score
                </div>
              )}
            </div>

            {/* Quick Actions Bar */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
              <Link
                to={`/test-your-soil?autoTestId=${activeSoilTest?._id}`}
                className="btn btn-primary"
              >
                <ClipboardCheck size={16} />
                <span>FIND CROPS SUITABLE FOR MY SOIL</span>
              </Link>

              <a
                href="#improvement-plan-details"
                className="btn btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('improvement-plan-details')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Layers size={16} />
                <span>VIEW SOIL IMPROVEMENT PLAN</span>
              </a>
            </div>
          </div>

          {/* Parameter Comparison Table */}
          <div className="card">
            <h3 className="card-title">Parameter-by-Parameter Comparison Table</h3>
            <div className="card-subtitle">
              Evaluating your tested soil values against {crop.name}'s verified requirements
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Your Tested Soil</th>
                    <th>Crop Requirement</th>
                    <th>Data Source</th>
                    <th>Result & Deviation</th>
                  </tr>
                </thead>
                <tbody>
                  {(evalResult.recommendations[0]?.parameterComparisons || []).map((comp, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: '600' }}>{comp.parameter}</td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: '600' }}>
                        {comp.measuredValue}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {comp.requiredRange}
                      </td>
                      <td>
                        <span className={`badge badge-${comp.source === 'simulation' ? 'sim' : comp.source === 'hardware' ? 'hw' : 'ref'}`}>
                          {comp.source === 'hardware' ? 'IOT HARDWARE PROBE' : comp.source === 'simulation' ? 'IOT SENSOR STREAM' : 'FIELD PROFILE BASELINE'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          comp.status === 'Optimal' ? 'badge-suitable' :
                          comp.status === 'Acceptable' ? 'badge-suitable' :
                          comp.status === 'Deficient' ? 'badge-moderate' :
                          comp.status === 'Excessive' ? 'badge-unsuitable' : 'badge-moderate'
                        }`}>
                          {comp.status} {comp.deviationPercentage > 0 ? `(${comp.deviationPercentage}% deviation)` : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Soil Improvement Plan & Practicality Section */}
          {improvementPlan && (
            <div id="improvement-plan-details" className="card" style={{ borderTop: '4px solid #40916c' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <h3 className="card-title">Soil Improvement & Agronomic Action Plan</h3>
                  <div className="card-subtitle">Customized remediation for cultivating {crop.name}</div>
                </div>

                <div className={`badge ${improvementPlan.isImprovementPractical ? 'badge-suitable' : 'badge-unsuitable'}`} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                  {improvementPlan.isImprovementPractical ? 'Improvement is Practical' : 'High Remediation Burden'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: '8px', fontSize: '0.92rem', marginBottom: '20px', lineHeight: '1.6' }}>
                <strong>Agronomic Evaluation: </strong>{improvementPlan.practicalityExplanation}
              </div>

              {/* Deficiencies and Excesses Breakdown */}
              <div className="grid-2">
                <div>
                  <h4 style={{ fontWeight: '700', color: 'var(--primary-900)', marginBottom: '10px' }}>
                    Deficient Parameters & Suggested Amendments
                  </h4>
                  {improvementPlan.deficiencies?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {improvementPlan.deficiencies.map((d, i) => (
                        <div key={i} style={{ padding: '12px', border: '1px solid #fed7aa', backgroundColor: '#fff7ed', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '700', color: '#c2410c' }}>{d.parameter}</div>
                          <div style={{ fontSize: '0.82rem', color: '#7c2d12', marginTop: '2px' }}>{d.managementAction}</div>
                          <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: '#9a3412', marginTop: '6px' }}>
                            {d.suggestedAmendments?.map((am, ai) => <li key={ai}>{am}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No parameter deficiencies detected.</div>
                  )}
                </div>

                <div>
                  <h4 style={{ fontWeight: '700', color: 'var(--primary-900)', marginBottom: '10px' }}>
                    Excess Parameters & Remedial Measures
                  </h4>
                  {improvementPlan.excesses?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {improvementPlan.excesses.map((e, i) => (
                        <div key={i} style={{ padding: '12px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', borderRadius: '8px' }}>
                          <div style={{ fontWeight: '700', color: '#b91c1c' }}>{e.parameter}</div>
                          <div style={{ fontSize: '0.82rem', color: '#7f1d1d', marginTop: '2px' }}>{e.managementAction}</div>
                          <ul style={{ paddingLeft: '16px', fontSize: '0.78rem', color: '#991b1b', marginTop: '6px' }}>
                            {e.suggestedAmendments?.map((am, ai) => <li key={ai}>{am}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No parameter excesses detected.</div>
                  )}
                </div>
              </div>

              {/* Alternative Crops Recommendation */}
              {improvementPlan.alternativeCrops?.length > 0 && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                  <h4 style={{ fontWeight: '700', color: 'var(--primary-900)', marginBottom: '8px' }}>
                    Recommended Alternative Crops Suited to Current Soil
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Crops that naturally thrive in your soil's existing unamended state:
                  </p>
                  <div className="grid-3">
                    {improvementPlan.alternativeCrops.map((alt, i) => (
                      <div key={i} style={{ padding: '12px 14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: 'var(--primary-900)' }}>{alt.cropName}</strong>
                          <span className="badge badge-suitable">{alt.suitabilityLevel}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {alt.reason}
                        </div>
                        <Link
                          to={`/crop-to-soil?search=${encodeURIComponent(alt.cropName)}`}
                          style={{ fontSize: '0.78rem', color: 'var(--primary-700)', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}
                        >
                          <span>Inspect Crop</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TEST MY SOIL FOR THIS CROP - INTERACTIVE MODAL / DIALOG
          ========================================================================= */}
      {isTestModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <span className="badge badge-ref" style={{ backgroundColor: '#fef3c7', color: '#92400e', marginBottom: '4px' }}>
                  Target Crop: {crop.name} ({crop.scientificName})
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                  Test Your Soil for {crop.name}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  This evaluation will be stored in your soil test history.
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                style={{ fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: '1' }}
              >
                ✕
              </button>
            </div>

            {/* Select Data Source Mode */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Select Soil Telemetry Source
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTestMode('hardware')}
                  className={`btn ${testMode === 'hardware' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <span>Arduino Uno (USB)</span>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: iotConnected ? '#22c55e' : '#ef4444',
                    color: '#ffffff',
                    fontWeight: '700'
                  }}>
                    {iotConnected ? 'Online' : 'Disconnected'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode('simulation')}
                  className={`btn ${testMode === 'simulation' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  Field IoT Station
                </button>
                <button
                  type="button"
                  onClick={() => setTestMode('existing_profile')}
                  className={`btn ${testMode === 'existing_profile' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  Saved Plot Profile
                </button>
              </div>
            </div>

            {testMode === 'hardware' && !iotConnected ? (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.84rem',
                color: '#991b1b'
              }}>
                <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Hardware Disconnected:</strong> Arduino Uno is not connected via USB. You <strong>cannot use hardware mode</strong> until plugged in. Switch to <strong>Field IoT Station</strong> above.
                </div>
              </div>
            ) : (
              <div style={{
                backgroundColor: 'var(--badge-hw-bg)',
                border: '1px solid #bae6fd',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.84rem',
                color: '#0369a1'
              }}>
                <Radio size={16} />
                <div>
                  <strong>Telemetry Stream:</strong> Capacitive Moisture (Pin A0) • Thermal Probe (Pin A1) • Target: {crop.name}
                </div>
              </div>
            )}

            {testMode === 'existing_profile' ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Choose Registered Soil Profile
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-surface)',
                    fontFamily: 'inherit'
                  }}
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                >
                  {profiles.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.profileId} - {p.soilTypeName} ({p.location?.state}, {p.location?.district})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <form onSubmit={handleRunSuitabilityTest}>
                <div className="grid-2" style={{ gap: '14px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Target Plot ID</label>
                    <input
                      type="text"
                      name="plotId"
                      value={testForm.plotId}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Soil Moisture (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="moisture"
                      value={testForm.moisture}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Soil pH</label>
                    <input
                      type="number"
                      step="0.1"
                      name="pH"
                      value={testForm.pH}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Soil Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      value={testForm.temperature}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Nitrogen (N kg/ha)</label>
                    <input
                      type="number"
                      name="nitrogen"
                      value={testForm.nitrogen}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Phosphorus (P kg/ha)</label>
                    <input
                      type="number"
                      name="phosphorus"
                      value={testForm.phosphorus}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Potassium (K kg/ha)</label>
                    <input
                      type="number"
                      name="potassium"
                      value={testForm.potassium}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Soil Texture</label>
                    <select
                      name="texture"
                      value={testForm.texture}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
                    >
                      <option value="Loam">Loam</option>
                      <option value="Clay">Clay</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Sandy Loam">Sandy Loam</option>
                      <option value="Sand">Sand</option>
                      <option value="Silt Loam">Silt Loam</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => setIsTestModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={evaluating || (testMode === 'hardware' && !iotConnected)}
                    className="btn btn-accent"
                    style={{
                      opacity: (testMode === 'hardware' && !iotConnected) ? 0.6 : 1,
                      cursor: (testMode === 'hardware' && !iotConnected) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {evaluating
                      ? 'Evaluating compatibility...'
                      : (testMode === 'hardware' && !iotConnected)
                      ? 'Arduino Not Connected (Select Field Station)'
                      : 'Run IoT Suitability Evaluation'}
                  </button>
                </div>
              </form>
            )}

            {testMode === 'existing_profile' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRunSuitabilityTest}
                  disabled={evaluating}
                  className="btn btn-accent"
                >
                  {evaluating ? 'Evaluating profile...' : 'Evaluate Selected Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
