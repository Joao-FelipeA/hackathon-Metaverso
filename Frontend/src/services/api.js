import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Ajuste conforme necessário

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const steamAPI = {
  searchPlayer: (playerName) => 
    api.post('Steam/Steam_Search/', { player_name: playerName }),
};

export const dota2API = {
  searchPlayer: (steamId) => 
    api.post('Steam/Dota_Search/', { id: steamId }),
};

export const riotAPI = {
  searchPlayer: (gameName, tagLine, region) => 
    api.post('Riot/Riot_Search/', { 
      gameName, 
      tagLine, 
      region 
    }),
};

export default api;