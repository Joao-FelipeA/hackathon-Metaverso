import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SteamSearch from './pages/SteamSearch';
import Dota2Search from './pages/Dota2Search';
import RiotSearch from './pages/RiotSearch';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🎮 Gaming Hub
            </Link>
            <div className="nav-menu">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/steam" className="nav-link">Steam</Link>
              <Link to="/dota2" className="nav-link">Dota 2</Link>
              <Link to="/riot" className="nav-link">Riot Games</Link>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/steam" element={<SteamSearch />} />
            <Route path="/dota2" element={<Dota2Search />} />
            <Route path="/riot" element={<RiotSearch />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
