from django.shortcuts import render
from rest_framework import generics
import requests
from rest_framework.response import Response
from rest_framework import status
from decouple import config
from .serializer import SearchSteamResultSerializer, SearchDota2ResultSerializer, SearchRiotResultSerializer
from rest_framework.views import APIView

API_KEY = config('STEAM_API_KEY')
RIOT_API_KEY = config('RIOT_API_KEY')

class SearchSteam(APIView):
    serializer_class = SearchSteamResultSerializer

    def post(self, request):
        player_name = request.data.get('player_name')
        steam_id = request.data.get('steam_id')
        if not player_name:
            return Response({'error': 'O campo player_name é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        url = f'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key={API_KEY}&vanityurl={player_name}'
        response = requests.get(url)

        if response.status_code == 200:
            steam_id = self.search(response.json())
            if steam_id:
                return Response({'steam_id': steam_id, 'player_name': player_name})
            else:
                return Response({'error': 'Usuário não encontrado', 'player_name': player_name}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error': 'Falha na comunicação com a API Steam.'}, status=response.status_code)

    def search(self, search_result):
        return search_result.get('response', {}).get('steamid')
    
class SearchDota2(APIView):
    serializer_class = SearchDota2ResultSerializer

    def post(self, request):
        id = request.data.get('id')
        id32 = int(id) - 76561197960265728
        url = f'https://api.opendota.com/api/players/{id32}/recentMatches'
        response = requests.get(url)
        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response({'error': 'Falha ao buscar dados do jogador.'}, status=response.status_code)
        
    def search(self, search_result):
        return search_result.get('response', {}).get('recentMatches')

class SearchRiot(APIView):
    serializer_class = SearchRiotResultSerializer

    def post(self, request):
        summoner_name = request.data.get('summoner_name')
        region = request.data.get('region')
        if not summoner_name:
            return Response({'error': 'O campo summoner_name é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)

        url = f'https://{region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}?api_key={RIOT_API_KEY}'
        response = requests.get(url)

        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response({'error': 'Falha na comunicação com a API Riot.'}, status=response.status_code)
    
    def search(self, search_result):
        return search_result.get('response', {}).get('uuid')