import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import SteamSearch from './pages/SteamSearch';
import Dota2Search from './pages/Dota2Search';
import RiotSearch from './pages/RiotSearch';
import Home from './pages/Home';

function Sidebar() {
  const location = useLocation();
  
  const getActiveIcon = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <div className="logo"></div>
      <Link to="/" className={`nav-icon ${getActiveIcon('/')}`}>
        �
      </Link>
      <Link to="/steam" className={`nav-icon ${getActiveIcon('/steam')}`}>
        🚂
      </Link>
      <Link to="/dota2" className={`nav-icon ${getActiveIcon('/dota2')}`}>
        ⚔️
      </Link>
      <Link to="/riot" className={`nav-icon ${getActiveIcon('/riot')}`}>
        🎯
      </Link>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        
        <div className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/steam" element={<SteamSearch />} />
            <Route path="/dota2" element={<Dota2Search />} />
            <Route path="/riot" element={<RiotSearch />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
