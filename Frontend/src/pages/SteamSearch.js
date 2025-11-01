import React, { useState } from 'react';
import { steamAPI } from '../services/api';

function SteamSearch() {
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Por favor, digite um nome de jogador');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await steamAPI.searchPlayer(playerName);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar jogador');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="header">
        <div>
          <h1>🚂 Steam Player Search</h1>
          <p>Find Steam players by their username</p>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #36b8ff' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter Steam username..."
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                backgroundColor: '#0f1629',
                color: '#fff',
                fontSize: '1rem'
              }}
            />
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #2f6bff, #36e0f9)',
                color: '#fff',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Searching...' : 'Search Player'}
            </button>
          </form>
        </div>
      </div>

      {loading && (
        <div className="chart-box">
          <div style={{ color: '#36b8ff', fontSize: '1.2rem' }}>
            🔍 Searching for player...
          </div>
        </div>
      )}

      {error && (
        <div className="stat-card" style={{ borderLeft: '4px solid #ff7b42' }}>
          <h3 style={{ color: '#ff7b42' }}>Error</h3>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="insights">
          <h2>Player Found</h2>
          <div className="tip">
            <span className="tip-icon">👤</span>
            <strong>Player Name:</strong> {result.player_name}
          </div>
          <div className="tip">
            <span className="tip-icon">🆔</span>
            <strong>Steam ID:</strong> {result.steam_id}
          </div>
        </div>
      )}
    </>
  );
}

export default SteamSearch;