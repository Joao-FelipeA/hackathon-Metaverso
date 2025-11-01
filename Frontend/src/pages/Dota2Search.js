import React, { useState } from 'react';
import { dota2API } from '../services/api';

function Dota2Search() {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!steamId.trim()) {
      setError('Por favor, digite um Steam ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await dota2API.searchPlayer(steamId);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar dados do Dota 2');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minutos`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>
        ⚔️ Buscar Jogador no Dota 2
      </h2>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label className="form-label">Steam ID:</label>
          <input
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="Digite o Steam ID..."
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
          Buscando dados do jogador...
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {result && result.profile && (
        <div className="results-container">
          <div className="result-item">
            <div className="result-header">
              <h3 className="result-title">Perfil do Jogador</h3>
            </div>
            <div className="result-info">
              <div className="info-item">
                <span className="info-label">Nome</span>
                <span className="info-value">{result.profile.personaname || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Account ID</span>
                <span className="info-value">{result.profile.account_id}</span>
              </div>
            </div>
          </div>

          {result.matches && result.matches.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Partidas Recentes</h3>
              {result.matches.map((match, index) => (
                <div key={match.match_id || index} className="result-item">
                  <div className="result-header">
                    <h4 className="result-title">Match ID: {match.match_id}</h4>
                    <span className={match.detail?.radiant_win ? 'win' : 'loss'}>
                      {match.detail?.radiant_win ? 'Vitória' : 'Derrota'}
                    </span>
                  </div>
                  
                  <div className="result-info">
                    <div className="info-item">
                      <span className="info-label">Herói ID</span>
                      <span className="info-value">{match.hero_id}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duração</span>
                      <span className="info-value">{formatDuration(match.duration)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Data</span>
                      <span className="info-value">{formatDate(match.start_time)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Tipo de Lobby</span>
                      <span className="info-value">{match.lobby_type}</span>
                    </div>
                  </div>

                  {match.detail?.player_metrics && (
                    <div className="match-stats">
                      <div className="stat-item">
                        <span className="stat-value">{match.detail.player_metrics.kills || 0}</span>
                        <span className="stat-label">Kills</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{match.detail.player_metrics.deaths || 0}</span>
                        <span className="stat-label">Deaths</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{match.detail.player_metrics.assists || 0}</span>
                        <span className="stat-label">Assists</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-value">{match.detail.player_metrics.gold_per_min || 0}</span>
                        <span className="stat-label">GPM</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dota2Search;