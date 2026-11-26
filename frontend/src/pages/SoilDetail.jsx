import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  MapPin,
  Droplets,
  Sprout,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { getSoilTypeById } from '../services/api';

export default function SoilDetail() {
  const { id } = useParams();
  const [soil, setSoil] = useState(null);
  const [groupedCrops, setGroupedCrops] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSoilDetails();
  }, [id]);

  const fetchSoilDetails = async () => {
    try {
      const res = await getSoilTypeById(id);
      setSoil(res.data.data);
      setGroupedCrops(res.data.groupedCrops);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load soil details:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading benchmark soil series...
      </div>
    );
  }

  if (!soil) {
    return (
      <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Soil Type Not Found</h3>
        <Link to="/soil-to-crop" className="btn btn-outline" style={{ marginTop: '16px' }}>
          Back to Soil Catalog
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      <div>
        <Link to="/soil-to-crop" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} />
          <span>Back to Soil to Crop Explorer</span>
        </Link>
      </div>

      <div className="card" style={{ borderLeft: '6px solid var(--primary-700)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-600)', textTransform: 'uppercase' }}>
              ICAR Benchmark Soil Series
            </span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
              {soil.name}
            </h1>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: '500', marginTop: '2px' }}>
              {soil.classification}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="badge badge-ref" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Typical pH: {soil.typicalPH?.min} - {soil.typicalPH?.max} (Median: {soil.typicalPH?.median})
            </div>
          </div>
        </div>

        <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '16px', lineHeight: '1.6' }}>
          {soil.shortDescription}
        </p>

        <div className="scientific-disclaimer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '2px' }}>
            <Info size={16} />
            <span>Reference Soil Characteristics</span>
          </div>
          These parameters describe typical regional properties of {soil.name} documented across Indian agro-climatic zones. They are not sensor measurements of your land.
        </div>
      </div>

      <div className="grid-3">
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Droplets size={20} color="var(--primary-700)" />
            <span>Hydrological Properties</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginTop: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Water-Holding Capacity: </span>
              <strong>{soil.moistureCharacteristics?.waterHoldingCapacity || 'Moderate'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Drainage Behavior: </span>
              <strong>{soil.drainage || 'Well-drained'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Moisture Retention: </span>
              <strong>{soil.waterRetention || 'Good'}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} color="var(--primary-700)" />
            <span>Nutrient & Chemical Status</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginTop: '14px' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Nitrogen (N): </span>
              <strong>{soil.nutrientCharacteristics?.nitrogenStatus || 'Low'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Phosphorus (P): </span>
              <strong>{soil.nutrientCharacteristics?.phosphorusStatus || 'Medium'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Potassium (K): </span>
              <strong>{soil.nutrientCharacteristics?.potassiumStatus || 'High'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Organic Carbon: </span>
              <strong>{soil.nutrientCharacteristics?.organicCarbon || 'Medium'}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="var(--primary-700)" />
            <span>Distribution & Textures</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', marginTop: '14px' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Common Textures:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(soil.texture || []).map((t, i) => (
                  <span key={i} style={{ backgroundColor: 'var(--bg-subtle)', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>States & Basins:</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {(soil.geographicDistribution || []).join(', ')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '8px' }}>
          Crop Suitability for {soil.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Crops agronomically matched by ICAR for this soil type, grouped by suitability level. Click any crop to test your soil or inspect requirements.
        </p>

        {groupedCrops?.highlySuitable?.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle size={20} color="#15803d" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#15803d' }}>
                Highly Suitable Crops
              </h3>
            </div>
            <div className="grid-3">
              {groupedCrops.highlySuitable.map((crop, idx) => (
                <div key={idx} className="card" style={{ borderLeft: '4px solid #15803d', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{crop.cropName}</h4>
                      <span className="badge badge-suitable">Highly Suitable</span>
                    </div>
                    {crop.scientificName && (
                      <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {crop.scientificName}
                      </div>
                    )}
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      {crop.explanation}
                    </p>
                  </div>
                  <Link
                    to={`/crop-to-soil?search=${encodeURIComponent(crop.cropName)}`}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '16px', alignSelf: 'flex-start' }}
                  >
                    <span>View Crop Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedCrops?.suitable?.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircle size={20} color="#2d6a4f" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#2d6a4f' }}>
                Suitable Crops (Standard Management)
              </h3>
            </div>
            <div className="grid-3">
              {groupedCrops.suitable.map((crop, idx) => (
                <div key={idx} className="card" style={{ borderLeft: '4px solid #52b788', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{crop.cropName}</h4>
                      <span className="badge badge-suitable">Suitable</span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                      {crop.explanation}
                    </p>
                  </div>
                  <Link
                    to={`/crop-to-soil?search=${encodeURIComponent(crop.cropName)}`}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '16px', alignSelf: 'flex-start' }}
                  >
                    <span>View Crop Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {groupedCrops?.suitableWithImprovements?.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={20} color="#b45309" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#b45309' }}>
                Suitable with Soil Improvements
              </h3>
            </div>
            <div className="grid-3">
              {groupedCrops.suitableWithImprovements.map((crop, idx) => (
                <div key={idx} className="card" style={{ borderLeft: '4px solid #d97706', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{crop.cropName}</h4>
                      <span className="badge badge-moderate">Improvements Needed</span>
                    </div>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.5' }}>
                      {crop.explanation}
                    </p>
                  </div>
                  <Link
                    to={`/crop-to-soil?search=${encodeURIComponent(crop.cropName)}`}
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '16px', alignSelf: 'flex-start' }}
                  >
                    <span>View Crop Details</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
