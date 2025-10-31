from django.shortcuts import render
from rest_framework import generics
import requests
from rest_framework.response import Response
from rest_framework import status
from decouple import config
from .serializer import SearchSteamResultSerializer, SearchDota2ResultSerializer, SearchRiotResultSerializer, SearchRiotMatchSerializer
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
        gameName = request.data.get('gameName')
        tagLine = request.data.get('tagLine')
        region = request.data.get('region')

        if not gameName or not tagLine or not region:
            return Response({'error': 'Todos os campos são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        account_url = f'https://{region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}?api_key={RIOT_API_KEY}'
        account_response = requests.get(account_url)

        if account_response.status_code != 200:
            return Response(
                {'error': 'Erro ao buscar conta Riot.', 'status_code': account_response.status_code},
                status=account_response.status_code
            )

        account_data = account_response.json()
        puuid = account_data.get("puuid")

        if not puuid:
            return Response({'error': 'PUUID não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        match_url = f'https://{region}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?start=0&count=10&api_key={RIOT_API_KEY}'
        match_response = requests.get(match_url)

        if match_response.status_code != 200:
            return Response(
                {'error': 'Erro ao buscar partidas.', 'status_code': match_response.status_code},
                status=match_response.status_code
            )

        match_ids = match_response.json()

        return Response({
            "puuid": puuid,
            "matches": match_ids
        })
    
class SearchMatchesRiot(APIView):
    serializer_class = SearchRiotMatchSerializer

    def post(self, request):
        match_id = request.data.get('matchId')
        region = request.data.get('region')

        if not match_id or not region:
            return Response({'error': 'Todos os campos são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        match_url = f'https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}?api_key={RIOT_API_KEY}'
        match_response = requests.get(match_url)

        if match_response.status_code != 200:
            return Response(
                {'error': 'Erro ao buscar partidas.', 'status_code': match_response.status_code},
                status=match_response.status_code
            )

        match_ids = match_response.json()

        info = match_ids.get('info', {})
        participants = info.get('participants', [])
        gameDuration = info.get('gameDuration', None)
        gametype = info.get('gameType', None)
        gameVersion = info.get('gameVersion', None)

        result = []
        for p in participants:
            result.append({
            "puuid": p.get("puuid"),
            "controlWardTimeCoverageInRiverOrEnemyHalf": p.get("challenges", {}).get("controlWardTimeCoverageInRiverOrEnemyHalf"),
            "controlWardsPlaced": p.get("controlWardsPlaced"),
            "dodgeSkillShotsSmallWindow": p.get("challenges", {}).get("dodgeSkillShotsSmallWindow"),
            "earliestBaron": p.get("challenges", {}).get("earliestBaron"),
            "earliestDragonTakedown": p.get("challenges", {}).get("earliestDragonTakedown"),
            "firstTurretKilled": 1 if p.get("firstTurretKilled") else 0,
            "firstTurretKilledTime": p.get("challenges", {}).get("firstTurretKilledTime"),
            "getTakedownsInAllLanesEarlyJungleAsLaner": p.get("challenges", {}).get("getTakedownsInAllLanesEarlyJungleAsLaner"),
            "goldPerMinute": p.get("challenges", {}).get("goldPerMinute"),
            "jungleCsBefore10Minutes": p.get("challenges", {}).get("jungleCsBefore10Minutes"),
            })

        return Response({
            "participants": result,
            "gameDuration": gameDuration,
            "gametype": gametype,
            "gameVersion": gameVersion,
        })