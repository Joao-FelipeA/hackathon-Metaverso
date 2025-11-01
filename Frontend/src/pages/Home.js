import React, { useState } from 'react';
import { steamAPI, dota2API, riotAPI } from '../services/api';

function Home() {
  // Estados para controlar qual seção está expandida
  const [expandedSection, setExpandedSection] = useState(null);
  
  // Estados para Steam
  const [steamPlayerName, setSteamPlayerName] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);
  const [steamResult, setSteamResult] = useState(null);
  const [steamError, setSteamError] = useState(null);

  // Estados para Dota 2
  const [dota2SteamId, setDota2SteamId] = useState('');
  const [dota2Loading, setDota2Loading] = useState(false);
  const [dota2Result, setDota2Result] = useState(null);
  const [dota2Error, setDota2Error] = useState(null);

  // Estados para Riot
  const [riotGameName, setRiotGameName] = useState('');
  const [riotTagLine, setRiotTagLine] = useState('');
  const [riotRegion, setRiotRegion] = useState('americas');
  const [riotLoading, setRiotLoading] = useState(false);
  const [riotResult, setRiotResult] = useState(null);
  const [riotError, setRiotError] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
    // Limpar resultados ao fechar
    if (expandedSection === section) {
      clearResults();
    }
  };

  const clearResults = () => {
    setSteamResult(null);
    setSteamError(null);
    setDota2Result(null);
    setDota2Error(null);
    setRiotResult(null);
    setRiotError(null);
  };

  // Função para buscar no Steam
  const handleSteamSearch = async (e) => {
    e.preventDefault();
    if (!steamPlayerName.trim()) {
      setSteamError('Por favor, digite um nome de jogador');
      return;
    }

    setSteamLoading(true);
    setSteamError(null);
    setSteamResult(null);

    try {
      const response = await steamAPI.searchPlayer(steamPlayerName);
      setSteamResult(response.data);
    } catch (err) {
      setSteamError(err.response?.data?.error || 'Erro ao buscar jogador');
    } finally {
      setSteamLoading(false);
    }
  };

  // Função para buscar no Dota 2
  const handleDota2Search = async (e) => {
    e.preventDefault();
    if (!dota2SteamId.trim()) {
      setDota2Error('Por favor, digite um Steam ID');
      return;
    }

    setDota2Loading(true);
    setDota2Error(null);
    setDota2Result(null);

    try {
      const response = await dota2API.searchPlayer(dota2SteamId);
      setDota2Result(response.data);
    } catch (err) {
      setDota2Error(err.response?.data?.error || 'Erro ao buscar dados do Dota 2');
    } finally {
      setDota2Loading(false);
    }
  };

  // Função para buscar na Riot
  const handleRiotSearch = async (e) => {
    e.preventDefault();
    if (!riotGameName.trim() || !riotTagLine.trim()) {
      setRiotError('Por favor, preencha todos os campos');
      return;
    }

    setRiotLoading(true);
    setRiotError(null);
    setRiotResult(null);

    try {
      const response = await riotAPI.searchPlayer(riotGameName, riotTagLine, riotRegion);
      setRiotResult(response.data);
    } catch (err) {
      setRiotError(err.response?.data?.error || 'Erro ao buscar jogador');
    } finally {
      setRiotLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="header">
        <div>
          <h1>Hello, Gamer!</h1>
          <p>Search players across all gaming platforms</p>
        </div>
      </div>

      <div className="stats-grid">
        {/* Steam Search Card */}
        <div className="stat-card clickable" style={{ borderLeft: '4px solid #36b8ff' }} onClick={() => toggleSection('steam')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>🚂 Steam</h3>
              <span>Search Steam players</span>
            </div>
            <div className={`expand-icon ${expandedSection === 'steam' ? 'expanded' : ''}`}>
              +
            </div>
          </div>
        </div>

        {/* Dota 2 Search Card */}
        <div className="stat-card clickable" style={{ borderLeft: '4px solid #00d884' }} onClick={() => toggleSection('dota2')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>⚔️ Dota 2</h3>
              <span>Analyze Dota 2 matches</span>
            </div>
            <div className={`expand-icon ${expandedSection === 'dota2' ? 'expanded' : ''}`}>
              +
            </div>
          </div>
        </div>

        {/* Riot Search Card */}
        <div className="stat-card clickable" style={{ borderLeft: '4px solid #ff7b42' }} onClick={() => toggleSection('riot')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>🎯 Riot Games</h3>
              <span>League of Legends stats</span>
            </div>
            <div className={`expand-icon ${expandedSection === 'riot' ? 'expanded' : ''}`}>
              +
            </div>
          </div>
        </div>

        {/* Stats placeholder */}
        <div className="stat-card consistency">
          <h3>3</h3>
          <span>Platforms — Steam, Dota 2, LoL</span>
        </div>
      </div>

      {/* Expanded Search Forms */}
      {expandedSection === 'steam' && (
        <div className="insights">
          <h2>🚂 Steam Player Search</h2>
          <form onSubmit={handleSteamSearch} className="search-form">
            <div className="form-row">
              <input
                type="text"
                value={steamPlayerName}
                onChange={(e) => setSteamPlayerName(e.target.value)}
                placeholder="Enter Steam username..."
                className="form-input"
              />
              <button 
                type="submit" 
                disabled={steamLoading}
                className="form-button btn-steam"
              >
                {steamLoading && <span className="loading-spinner"></span>}
                {steamLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {steamError && (
            <div className="error-message">
              ❌ {steamError}
            </div>
          )}

          {steamResult && (
            <div className="result-section">
              <div className="tip">
                <span className="tip-icon">👤</span>
                <strong>Player:</strong> {steamResult.player_name}
              </div>
              <div className="tip">
                <span className="tip-icon">🆔</span>
                <strong>Steam ID:</strong> {steamResult.steam_id}
              </div>
            </div>
          )}
        </div>
      )}

      {expandedSection === 'dota2' && (
        <div className="insights">
          <h2>⚔️ Dota 2 Player Search</h2>
          <form onSubmit={handleDota2Search} className="search-form">
            <div className="form-row">
              <input
                type="text"
                value={dota2SteamId}
                onChange={(e) => setDota2SteamId(e.target.value)}
                placeholder="Enter Steam ID..."
                className="form-input"
              />
              <button 
                type="submit" 
                disabled={dota2Loading}
                className="form-button btn-dota2"
              >
                {dota2Loading && <span className="loading-spinner"></span>}
                {dota2Loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {dota2Error && (
            <div className="error-message">
              ❌ {dota2Error}
            </div>
          )}

          {dota2Result && dota2Result.profile && (
            <div className="result-section">
              <div className="tip">
                <span className="tip-icon">👤</span>
                <strong>Player:</strong> {dota2Result.profile.personaname || 'N/A'}
              </div>
              <div className="tip">
                <span className="tip-icon">🆔</span>
                <strong>Account ID:</strong> {dota2Result.profile.account_id}
              </div>
              {dota2Result.matches && dota2Result.matches.length > 0 && (
                <div className="tip">
                  <span className="tip-icon">🎮</span>
                  <strong>Recent Matches:</strong> {dota2Result.matches.length} found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {expandedSection === 'riot' && (
        <div className="insights">
          <h2>🎯 Riot Games Player Search</h2>
          <form onSubmit={handleRiotSearch} className="search-form">
            <div className="form-row">
              <input
                type="text"
                value={riotGameName}
                onChange={(e) => setRiotGameName(e.target.value)}
                placeholder="Game name..."
                className="form-input"
              />
              <input
                type="text"
                value={riotTagLine}
                onChange={(e) => setRiotTagLine(e.target.value)}
                placeholder="Tag line..."
                className="form-input"
              />
              <select
                value={riotRegion}
                onChange={(e) => setRiotRegion(e.target.value)}
                className="form-select"
              >
                <option value="americas">Americas</option>
                <option value="asia">Asia</option>
                <option value="europa">Europa</option>
              </select>
              <button 
                type="submit" 
                disabled={riotLoading}
                className="form-button btn-riot"
              >
                {riotLoading && <span className="loading-spinner"></span>}
                {riotLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {riotError && (
            <div className="error-message">
              ❌ {riotError}
            </div>
          )}

          {riotResult && (
            <div className="result-section">
              <div className="tip">
                <span className="tip-icon">👤</span>
                <strong>Player:</strong> {riotResult.gameName}#{riotResult.tagLine}
              </div>
              <div className="tip">
                <span className="tip-icon">🆔</span>
                <strong>PUUID:</strong> {riotResult.puuid?.substring(0, 20)}...
              </div>
              {riotResult.matches && riotResult.matches.length > 0 && (
                <div className="tip">
                  <span className="tip-icon">🎮</span>
                  <strong>Recent Matches:</strong> {riotResult.matches.length} found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!expandedSection && (
        <div className="charts">
          <div className="chart-box">
            <h3>📊 Quick Stats</h3>
            <p>Click on any platform above to start searching for players and view their statistics</p>
          </div>
          <div className="chart-box">
            <h3>🔍 Search Features</h3>
            <p>• Steam player lookup<br/>• Dota 2 match history<br/>• League of Legends stats</p>
          </div>
        </div>
      )}
    </>
  );
}

export default Home;