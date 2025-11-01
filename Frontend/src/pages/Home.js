import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="card">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>
        🎮 Gaming Hub
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '3rem', color: '#666' }}>
        Busque jogadores e estatísticas dos seus jogos favoritos
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginTop: '2rem'
      }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>🚂 Steam</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Busque jogadores do Steam por nome de usuário
          </p>
          <Link to="/steam" className="btn btn-primary">
            Buscar no Steam
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>⚔️ Dota 2</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Veja estatísticas e partidas do Dota 2
          </p>
          <Link to="/dota2" className="btn btn-primary">
            Buscar no Dota 2
          </Link>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>🎯 Riot Games</h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Busque jogadores do League of Legends
          </p>
          <Link to="/riot" className="btn btn-primary">
            Buscar na Riot
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;