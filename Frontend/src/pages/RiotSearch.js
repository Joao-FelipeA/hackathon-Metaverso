import React, { useState } from 'react';
import { riotAPI } from '../services/api';

function RiotSearch() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('americas');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gameName.trim() || !tagLine.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await riotAPI.searchPlayer(gameName, tagLine, region);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao buscar jogador');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>
        🎯 Buscar Jogador na Riot Games
      </h2>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="form-group">
          <label className="form-label">Nome do Jogo:</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Digite o nome do jogador..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tag Line:</label>
          <input
            type="text"
            value={tagLine}
            onChange={(e) => setTagLine(e.target.value)}
            placeholder="Digite a tag (ex: BR1, EUW1)..."
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Região:</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="form-select"
          >
            <option value="americas">Americas</option>
            <option value="asia">Asia</option>
            <option value="europa">Europa</option>
          </select>
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
                <span className="info-label">Nome do Jogo</span>
                <span className="info-value">{result.gameName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Tag Line</span>
                <span className="info-value">{result.tagLine}</span>
              </div>
              <div className="info-item">
                <span className="info-label">PUUID</span>
                <span className="info-value" style={{ fontSize: '0.8rem' }}>{result.puuid}</span>
              </div>
            </div>
          </div>

          {result.matches && result.matches.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Partidas Recentes</h3>
              {result.matches.map((match, index) => (
                <div key={match.matchId || index} className="result-item">
                  <div className="result-header">
                    <h4 className="result-title">Match ID: {match.matchId}</h4>
                    <div>
                      <span style={{ marginRight: '1rem', color: '#666' }}>
                        Duração: {formatDuration(match.gameDuration)}
                      </span>
                      <span style={{ color: '#666' }}>
                        Tipo: {match.gameType}
                      </span>
                    </div>
                  </div>
                  
                  {match.participants && match.participants.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h5 style={{ marginBottom: '0.5rem', color: '#667eea' }}>Participantes:</h5>
                      <div style={{ 
                        display: 'grid', 
                        gap: '0.5rem',
                        maxHeight: '300px',
                        overflowY: 'auto'
                      }}>
                        {match.participants.map((participant, pIndex) => (
                          <div key={pIndex} style={{
                            background: '#f8f9fa',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong>{participant.playerName}</strong>
                                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                                  #{participant.tagLine}
                                </span>
                              </div>
                              <span className={participant.win ? 'win' : 'loss'}>
                                {participant.win ? 'Vitória' : 'Derrota'}
                              </span>
                            </div>
                            
                            <div className="match-stats" style={{ marginTop: '0.5rem' }}>
                              <div className="stat-item">
                                <span className="stat-value">{participant.kills}</span>
                                <span className="stat-label">Kills</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{participant.deaths}</span>
                                <span className="stat-label">Deaths</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{participant.assists}</span>
                                <span className="stat-label">Assists</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{participant.championName}</span>
                                <span className="stat-label">Campeão</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{participant.teamPosition || 'ARAM'}</span>
                                <span className="stat-label">Posição</span>
                              </div>
                              <div className="stat-item">
                                <span className="stat-value">{Math.round(participant.goldPerMinute || 0)}</span>
                                <span className="stat-label">GPM</span>
                              </div>
                            </div>
                          </div>
                        ))}
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

export default RiotSearch;