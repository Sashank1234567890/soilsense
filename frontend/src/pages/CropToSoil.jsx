import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Sprout, Filter, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { searchCrops, getCrops } from '../services/api';

export default function CropToSoil() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrops(searchQuery, selectedCategory);
  }, [selectedCategory]);

  const fetchCrops = async (query, category) => {
    setLoading(true);
    try {
      const res = (!query && !category)
        ? await getCrops()
        : await searchCrops(query, category);
      setCrops(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to search crops:', err);
      // Fallback try getCrops
      try {
        const fallback = await getCrops();
        setCrops(fallback.data.data || []);
      } catch (e2) {
        setCrops([]);
      }
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    fetchCrops(val, selectedCategory);
  };

  const categories = ['All', 'Cereal', 'Pulse', 'Cash Crop', 'Oilseed', 'Vegetable', 'Tuber', 'Fiber Crop'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
          <Sprout size={18} />
          <span>Module 2: Crop Agronomic Requirements & Soil Matcher</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginTop: '4px' }}>
          Crop to Soil Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>
          Search Indian crops, inspect physiological thresholds, and test your soil specifically against agronomic requirements.
        </p>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="search-box-container" style={{ flex: '1', minWidth: '280px' }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search for a crop... (e.g. Wheat, Rice, Cotton, Triticum, Punjab)"
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
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'All' ? '' : e.target.value)}
            >
              {categories.map((cat, idx) => (
                <option key={idx} value={cat === 'All' ? '' : cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchQuery && (
          <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing results for: <strong>"{searchQuery}"</strong> ({crops.length} crops found)
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading crops catalogue...
        </div>
      ) : crops.length > 0 ? (
        <div className="grid-3">
          {crops.map((crop) => (
            <div
              key={crop._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0',
                overflow: 'hidden'
              }}
            >
              {crop.image && (
                <div style={{ height: '160px', overflow: 'hidden', backgroundColor: '#e2e8f0' }}>
                  <img
                    src={crop.image}
                    alt={crop.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div style={{ padding: '20px', flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-900)' }}>
                      {crop.name}
                    </h3>
                    <span className="badge badge-ref" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                      {crop.category}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.82rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {crop.scientificName}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
                    {crop.description.length > 130 ? `${crop.description.substring(0, 130)}...` : crop.description}
                  </p>

                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Optimal pH: </span>
                      <strong>{crop.idealRequirements?.pH?.optimalMin} - {crop.idealRequirements?.pH?.optimalMax}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Moisture: </span>
                      <strong>{crop.idealRequirements?.moisture?.optimalMin}% - {crop.idealRequirements?.moisture?.optimalMax}%</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    to={`/crop-to-soil/${crop._id}`}
                    className="btn btn-primary"
                    style={{ flex: '1' }}
                  >
                    <span>View & Test</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary-900)' }}>
            No Crops Found
          </h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            No crops matched "{searchQuery}". Try searching for Wheat, Rice, Cotton, Maize, Mustard, Potato, Tomato, Soybean, or Chickpea.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory(''); fetchCrops('', ''); }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '16px' }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
