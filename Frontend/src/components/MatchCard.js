import React from 'react';

function MatchCard({ match, gameType = 'generic' }) {
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

  if (gameType === 'dota2') {
    return (
      <div className="result-item">
        <div className="result-header">
          <h4 className="result-title">Match {match.match_id}</h4>
          <span className={match.detail?.radiant_win ? 'win' : 'loss'}>
            {match.detail?.radiant_win ? 'Vitória Radiant' : 'Vitória Dire'}
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
            <span className="info-label">Skill Level</span>
            <span className="info-value">{match.skill || 'N/A'}</span>
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
            <div className="stat-item">
              <span className="stat-value">{match.detail.player_metrics.xp_per_min || 0}</span>
              <span className="stat-label">XPM</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{match.detail.player_metrics.last_hits || 0}</span>
              <span className="stat-label">Last Hits</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameType === 'riot') {
    return (
      <div className="result-item">
        <div className="result-header">
          <h4 className="result-title">Match {match.matchId}</h4>
          <div>
            <span style={{ marginRight: '1rem', color: '#666' }}>
              {formatDuration(match.gameDuration)}
            </span>
            <span style={{ color: '#666' }}>
              {match.gameType}
            </span>
          </div>
        </div>
        
        {match.participants && match.participants.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ 
              display: 'grid', 
              gap: '0.5rem',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {match.participants.map((participant, index) => (
                <div key={index} style={{
                  background: participant.win ? '#e8f5e8' : '#ffebee',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: `1px solid ${participant.win ? '#c8e6c9' : '#ffcdd2'}`
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
                      <span className="stat-label">K</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{participant.deaths}</span>
                      <span className="stat-label">D</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{participant.assists}</span>
                      <span className="stat-label">A</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{participant.championName}</span>
                      <span className="stat-label">Campeão</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{participant.teamPosition || 'ARAM'}</span>
                      <span className="stat-label">Lane</span>
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
    );
  }

  return null;
}

export default MatchCard;