import requests
import time
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
        url = f'https://api.opendota.com/api/players/{id32}/matches'
        response = requests.get(url)
        if response.status_code == 200:
            return Response(response.json())
        else:
            return Response({'error': 'Falha ao buscar dados do jogador.'}, status=response.status_code)
        
    def search(self, search_result):
        return search_result.get('response', {}).get('matches')

class SearchMatchesRiot(APIView):
    @staticmethod
    def get_match_details(region, match_id):
        match_url = f'https://{region}.api.riotgames.com/lol/match/v5/matches/{match_id}?api_key={RIOT_API_KEY}'
        match_response = requests.get(match_url)

        if match_response.status_code != 200:
            return None

        match_data = match_response.json()
        info = match_data.get('info', {})
        participants = info.get('participants', [])
        gameDuration = info.get('gameDuration')
        gameType = info.get('gameType')
        gameVersion = info.get('gameVersion')

        user_details = {}
        for p in participants:
            puuid = p.get("puuid")
            time.sleep(1)
            user_data = SearchRiotPlayer.player_detail(puuid, region)

            if user_data:
                user_details[puuid] = {
                    "gameName": user_data.get("gameName"),
                    "tagLine": user_data.get("tagLine")
                }
            else:
                user_details[puuid] = {
                    "gameName": "Desconhecido",
                    "tagLine": "N/A"
                }

        result = []
        for p in participants:
            puuid = p.get("puuid")
            challenges = p.get("challenges", {})

            result.append({
                "puuid": puuid,
                "playerName": user_details[puuid]["gameName"],
                "tagLine": user_details[puuid]["tagLine"],
                "goldPerMinute": challenges.get("goldPerMinute"),
                "controlWardsPlaced": p.get("controlWardsPlaced"),
                "firstTurretKilled": int(p.get("firstTurretKilled", False)),
                "gameEndedInSurrender": p.get("gameEndedInSurrender"),
                "kills": p.get("kills"),
                "deaths": p.get("deaths"),
                "assists": p.get("assists"),
                "championName": p.get("championName"),
                "lane": p.get("lane"),
                "teamPosition": p.get("teamPosition"),
                "win": p.get("win"),
        })

        return {
            "matchId": match_id,
            "participants": result,
            "gameDuration": gameDuration,
            "gameType": gameType,
            "gameVersion": gameVersion,
        }

    def post(self, request):
        match_id = request.data.get('matchId')
        region = request.data.get('region')

        if not match_id or not region:
            return Response({'error': 'Todos os campos são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        details = self.get_match_details(region, match_id)
        if details:
            return Response(details)
        else:
            return Response({'error': 'Erro ao buscar detalhes da partida.'}, status=status.HTTP_404_NOT_FOUND)
        
class SearchRiotPlayer(APIView):
    @staticmethod
    def player_detail(puuid, region):
        user_url = f'https://{region}.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}?api_key={RIOT_API_KEY}'
        user_response = requests.get(user_url)

        if user_response.status_code != 200:
            return None

        return user_response.json()

    def post(self, request):
        puuid = request.data.get('puuid')
        region = request.data.get('region')

        if not puuid or not region:
            return Response({'error': 'Todos os campos são obrigatórios.'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = self.player_detail(puuid, region)
        if user_data:
            return Response(user_data)
        else:
            return Response({'error': 'Erro ao buscar detalhes do jogador.'}, status=status.HTTP_404_NOT_FOUND)
        
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

        match_details = []
        for match_id in match_ids:
            details = SearchMatchesRiot.get_match_details(region, match_id)
            if details:
                match_details.append(details)

        return Response({
            "puuid": puuid,
            "matches": match_details
        })