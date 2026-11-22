import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Layers, MapPin, ArrowRight, Info, Filter } from 'lucide-react';
import { searchSoilTypes, getSoilTypes } from '../services/api';

export default function SoilToCrop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [soils, setSoils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTexture, setSelectedTexture] = useState('All');

  useEffect(() => {
    fetchSoils('');
  }, []);

  const fetchSoils = async (query) => {
    setLoading(true);
    try {
      const res = await searchSoilTypes(query);
      setSoils(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch soil types:', err);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchSoils(val);
  };

  // Client filter on texture if chosen
  const filteredSoils = soils.filter(s => {
    if (selectedTexture === 'All') return true;
    return s.texture && s.texture.some(t => t.toLowerCase().includes(selectedTexture.toLowerCase()));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header and Disclaimer */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-700)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <Layers size={18} />
          <span>Module 1: Reference Soil Knowledge Explorer</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
          Soil to Crop Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Search Indian soil benchmark series to discover typical physical profiles, pH ranges, and agronomically suitable crops.
        </p>

        {/* Scientific Disclaimer */}
        <div className="scientific-disclaimer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '4px' }}>
            <Info size={16} />
            <span>Important Agronomic Notice</span>
          </div>
          These descriptions represent benchmark regional soil series cataloged by ICAR & NBSS&LUP. They do not constitute actual real-time physical measurements of your individual land parcel. To measure your field directly, use <strong>Test Your Soil</strong>.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-box-container" style={{ flex: '1', minWidth: '280px' }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search your soil type... (e.g. Black, Alluvial, Laterite, Punjab, Vertisols)"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                backgroundColor: 'var(--bg-surface)',
                fontFamily: 'inherit',
                fontSize: '0.9rem'
              }}
              value={selectedTexture}
              onChange={(e) => setSelectedTexture(e.target.value)}
            >
              <option value="All">All Textures</option>
              <option value="Loam">Loam</option>
              <option value="Clay">Clay</option>
              <option value="Sand">Sand</option>
            </select>
          </div>
        </div>

        {searchQuery && (
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing results for query: <strong>"{searchQuery}"</strong> ({filteredSoils.length} found)
          </div>
        )}
      </div>

      {/* Soil Cards Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading soil series...
        </div>
      ) : filteredSoils.length > 0 ? (
        <div className="grid-3">
          {filteredSoils.map((soil) => (
            <div
              key={soil._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                    {soil.name}
                  </h3>
                  <span className="badge badge-ref" style={{ flexShrink: 0 }}>
                    {soil.typicalPH ? `pH ${soil.typicalPH.min} - ${soil.typicalPH.max}` : 'Reference'}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--primary-700)', fontWeight: '600', marginBottom: '12px' }}>
                  {soil.classification}
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                  {soil.shortDescription}
                </p>

                {/* Characteristics highlights */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Key Characteristics
                  </div>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(soil.characteristics || []).slice(0, 2).map((char, idx) => (
                      <li key={idx}>{char}</li>
                    ))}
                  </ul>
                </div>

                {/* Common Regions */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-600)' }} />
                  <span>
                    {(soil.geographicDistribution || []).slice(0, 3).join(', ')}
                    {(soil.geographicDistribution || []).length > 3 ? '...' : ''}
                  </span>
                </div>
              </div>

              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                <Link to={`/soil-to-crop/${soil._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  <span>View Details & Crops</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-900)' }}>
            No Soil Types Found
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            No soil types matched "{searchQuery}". Try searching for Alluvial, Black, Red, Laterite, Sandy, Clay, Loamy, Mountain, Desert, Saline, or Peaty.
          </p>
          <button
            onClick={() => { setSearchQuery(''); fetchSoils(''); }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '16px' }}
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
