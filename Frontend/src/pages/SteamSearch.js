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
    <div className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>
        🚂 Buscar Jogador no Steam
      </h2>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label className="form-label">Nome do Jogador:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Digite o nome do jogador..."
            className="form-input"
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          Buscando jogador...
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && (
        <div className="results-container">
          <div className="result-item">
            <div className="result-header">
              <h3 className="result-title">Jogador Encontrado</h3>
            </div>
            <div className="result-info">
              <div className="info-item">
                <span className="info-label">Nome do Jogador</span>
                <span className="info-value">{result.player_name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Steam ID</span>
                <span className="info-value">{result.steam_id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SteamSearch;