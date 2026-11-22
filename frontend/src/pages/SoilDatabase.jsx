import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Droplets,
  Layers,
  Sprout,
  RefreshCw,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { getSoilTypes } from '../services/api';

const CATEGORIES = [
  { id: 'all', label: 'All Soil Series' },
  { id: 'alluvial', label: 'Alluvial & Floodplain' },
  { id: 'black', label: 'Black (Vertisols)' },
  { id: 'red_laterite', label: 'Red & Lateritic' },
  { id: 'arid_sandy', label: 'Arid & Sandy' },
  { id: 'mountain_forest', label: 'Hilly & Forest' },
  { id: 'specialized', label: 'Saline / Peaty / Deltaic' }
];

export default function SoilDatabase() {
  const [soils, setSoils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadSoils();
  }, []);

  const loadSoils = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSoilTypes();
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setSoils(list);
    } catch (err) {
      console.error('Failed to load soil database:', err);
      setError('Unable to fetch Indian soil types from database. Please verify backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const matchesCategory = (soil, catId) => {
    if (catId === 'all') return true;
    const name = (soil.name || '').toLowerCase();
    const cls = (soil.classification || '').toLowerCase();

    if (catId === 'alluvial') {
      return name.includes('alluvial') || name.includes('calcareous') || cls.includes('entisols') || cls.includes('inceptisols');
    }
    if (catId === 'black') {
      return name.includes('black') || cls.includes('vertisols');
    }
    if (catId === 'red_laterite') {
      return name.includes('red') || name.includes('laterite') || cls.includes('oxisols') || cls.includes('ultisols');
    }
    if (catId === 'arid_sandy') {
      return name.includes('sandy') || name.includes('desert') || cls.includes('aridisols') || cls.includes('psamments');
    }
    if (catId === 'mountain_forest') {
      return name.includes('mountain') || name.includes('sub-mountain') || name.includes('terai') || name.includes('skeletal');
    }
    if (catId === 'specialized') {
      return name.includes('saline') || name.includes('peaty') || name.includes('deltaic') || name.includes('marine');
    }
    return true;
  };

  const filtered = (soils || []).filter(soil => {
    const q = search.trim().toLowerCase();
    const categoryMatch = matchesCategory(soil, selectedCategory);
    if (!categoryMatch) return false;

    if (!q) return true;

    const nameMatch = (soil.name || '').toLowerCase().includes(q);
    const classMatch = (soil.classification || '').toLowerCase().includes(q);
    const descMatch = (soil.shortDescription || '').toLowerCase().includes(q);
    const geoMatch = Array.isArray(soil.geographicDistribution) &&
      soil.geographicDistribution.some(g => typeof g === 'string' && g.toLowerCase().includes(q));
    const textureMatch = Array.isArray(soil.texture) &&
      soil.texture.some(t => typeof t === 'string' && t.toLowerCase().includes(q));
    const cropsMatch = Array.isArray(soil.suitableCropsSummary) &&
      soil.suitableCropsSummary.some(c => (c.cropName || '').toLowerCase().includes(q));

    return nameMatch || classMatch || descMatch || geoMatch || textureMatch || cropsMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <div style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
        color: '#ffffff',
        padding: '36px 32px',
        borderRadius: '18px',
        boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '840px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.16)',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: '700',
            letterSpacing: '0.5px',
            color: '#d1fae5',
            marginBottom: '12px'
          }}>
            <Database size={14} />
            <span>ICAR & NBSS&LUP SOIL TAXONOMY KNOWLEDGE BASE</span>
          </div>
          <h1 style={{ fontSize: '2.3rem', fontWeight: '800', color: '#ffffff', lineHeight: '1.2' }}>
            Indian Soil Series Database
          </h1>
          <p style={{ color: '#e6fcf5', marginTop: '10px', fontSize: '0.98rem', lineHeight: '1.6' }}>
            Comprehensive pedagogical repository of {soils.length || 16} benchmark Indian soil series classified under USDA Soil Taxonomy and ICAR agronomic standards, detailing genesis, nutrient regimes, and regional cropping suitability.
          </p>
        </div>

        <div style={{
          position: 'absolute',
          right: '32px',
          bottom: '28px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '12px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 1
        }}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', fontFamily: 'JetBrains Mono, monospace', color: '#ffffff', lineHeight: 1 }}>
              {soils.length}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#a7f3d0', fontWeight: '600', marginTop: '3px' }}>
              Soil Series Indexed
            </div>
          </div>
          <Compass size={28} color="#6ee7b7" />
        </div>
      </div>

      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div className="search-box-container" style={{ flex: 1 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by soil name, USDA taxonomy (e.g. Vertisols), Indian state, or texture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={loadSoils}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', fontWeight: '600' }}
            title="Reload Soil Database"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', marginRight: '4px' }}>
            Filter:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                fontSize: '0.78rem',
                fontWeight: selectedCategory === cat.id ? '700' : '500',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: selectedCategory === cat.id ? '#059669' : 'var(--border-light)',
                backgroundColor: selectedCategory === cat.id ? '#059669' : '#ffffff',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#dc2626',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                marginLeft: 'auto'
              }}
            >
              Clear Search ("{search}")
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <div style={{ flex: 1 }}>{error}</div>
          <button onClick={loadSoils} className="btn btn-sm btn-primary">
            Retry Loading
          </button>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin" style={{ margin: '0 auto 12px auto', color: '#059669' }} />
          <div style={{ fontSize: '1rem', fontWeight: '600' }}>Loading benchmark soil catalog...</div>
          <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>Fetching ICAR/NBSS&LUP series profiles</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={42} style={{ margin: '0 auto 14px auto', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            No Soil Series Found
          </h3>
          <p style={{ maxWidth: '420px', margin: '8px auto 18px auto', fontSize: '0.88rem' }}>
            No soil series matched your current query "{search}". Try searching for terms like "Alluvial", "Black", "Vertisols", or "Punjab".
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('all'); }}
              className="btn btn-outline btn-sm"
            >
              Reset Filters
            </button>
            <button onClick={loadSoils} className="btn btn-primary btn-sm">
              Reload Full Database
            </button>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(soil => (
            <div
              key={soil._id || soil.name}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0',
                overflow: 'hidden',
                position: 'relative',
                borderTop: '4px solid #059669'
              }}
            >
              {soil.image && (
                <div style={{ height: '140px', overflow: 'hidden', backgroundColor: '#f1f5f9', position: 'relative' }}>
                  <img
                    src={soil.image}
                    alt={soil.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    pH {soil.typicalPH?.min ?? '?'}&ndash;{soil.typicalPH?.max ?? '?'}
                  </div>
                </div>
              )}

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-900)', lineHeight: '1.25' }}>
                      {soil.name}
                    </h3>
                    {!soil.image && (
                      <span className="badge badge-ref" style={{ flexShrink: 0, fontWeight: '700' }}>
                        pH {soil.typicalPH?.min ?? '?'}&ndash;{soil.typicalPH?.max ?? '?'}
                      </span>
                    )}
                  </div>

                  <div style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: 'var(--primary-700)',
                    backgroundColor: '#f0fdf4',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    marginBottom: '10px'
                  }}>
                    {soil.classification || 'USDA / ICAR Taxonomy'}
                  </div>

                  <p style={{
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.55',
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {soil.shortDescription}
                  </p>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {soil.waterRetention && (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        Retention: {soil.waterRetention}
                      </span>
                    )}
                    {soil.drainage && (
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                        Drainage: {soil.drainage}
                      </span>
                    )}
                  </div>

                  {Array.isArray(soil.suitableCropsSummary) && soil.suitableCropsSummary.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Suitable Crops
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {soil.suitableCropsSummary.slice(0, 4).map((c, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '0.74rem',
                              backgroundColor: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #bbf7d0',
                              padding: '1px 7px',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}
                          >
                            {c.cropName}
                          </span>
                        ))}
                        {soil.suitableCropsSummary.length > 4 && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', padding: '1px 4px' }}>
                            +{soil.suitableCropsSummary.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#059669' }} />
                    <span style={{ lineHeight: '1.4' }}>
                      {(soil.geographicDistribution || []).slice(0, 4).join(', ')}
                      {(soil.geographicDistribution || []).length > 4 ? '...' : ''}
                    </span>
                  </div>
                </div>

                <div style={{ paddingTop: '16px', marginTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                  <Link
                    to={`/soil-to-crop/${soil._id}`}
                    className="btn btn-primary btn-sm"
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontWeight: '700',
                      padding: '8px 14px'
                    }}
                  >
                    <span>Explore Soil Profile</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
