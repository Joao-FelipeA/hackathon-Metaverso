import requests
from rest_framework.response import Response
from rest_framework import status
from decouple import config
from .serializer import SearchSteamResultSerializer, SearchDota2ResultSerializer, SearchRiotResultSerializer
from rest_framework.views import APIView

#API_KEY = config('STEAM_API_KEY')
RIOT_API_KEY = config('RIOT_API_KEY')

#Steam
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

    def search_dota(self, steam_id):
        try:
            id32 = int(steam_id) - 76561197960265728
        except Exception:
            return {"error": "Invalid Steam ID"}

        profile_url = f'https://api.opendota.com/api/players/{id32}'
        player_response = requests.get(profile_url)
        if player_response.status_code != 200:
            return {"error": "Failed to fetch player profile"}

        player_data = player_response.json()
        profile = player_data.get('profile', {})
        account_id = profile.get('account_id')
        personaname = profile.get('personaname')
        rank_tier = profile.get('rank_tier')

        matches_url = f'https://api.opendota.com/api/players/{id32}/matches'
        matches_response = requests.get(matches_url)
        if matches_response.status_code != 200:
            return {"error": "Failed to fetch matches"}

        matches_data = matches_response.json()
        recent_matches = matches_data[:10] if isinstance(matches_data, list) else []

        matches = []
        for m in recent_matches:
            match_id = m.get("match_id")
            if not match_id:
                continue

            detail_url = f'https://api.opendota.com/api/matches/{match_id}'
            detail_response = requests.get(detail_url)
            if detail_response.status_code != 200:
                continue

            detail_data = detail_response.json()

            player_detail = next(
                (p for p in detail_data.get("players", []) if p.get("account_id") == id32),
                None
            )

            player_metrics = {}
            if player_detail:
                player_metrics = {
                    "kills": player_detail.get("kills"),
                    "deaths": player_detail.get("deaths"),
                    "assists": player_detail.get("assists"),
                    "kda": player_detail.get("kda"),
                    "gold_per_min": player_detail.get("gold_per_min"),
                    "xp_per_min": player_detail.get("xp_per_min"),
                    "last_hits": player_detail.get("last_hits"),
                    "neutral_kills": player_detail.get("neutral_kills"),
                    "denies": player_detail.get("denies"),
                    "level": player_detail.get("level"),
                    "net_worth": player_detail.get("net_worth"),
                    "lane_efficiency_pct": player_detail.get("lane_efficiency_ptc"),
                }

            match_detail = {
                "duration": detail_data.get("duration"),
                "radiant_win": detail_data.get("radiant_win"),
                "region": detail_data.get("region"),
                "game_mode": detail_data.get("game_mode"),
                "player_metrics": player_metrics,
            }

            matches.append({
                "match_id": match_id,
                "hero_id": m.get("hero_id"),
                "start_time": m.get("start_time"),
                "duration": m.get("duration"),
                "lobby_type": m.get("lobby_type"),
                "skill": m.get("skill"),
                "player_slot": m.get("player_slot"),
                "detail": match_detail
            })

        return {
            "profile": {
                "account_id": account_id,
                "personaname": personaname,
                "rank_tier": rank_tier
            },
            "matches": matches
        }

    def post(self, request):
        steam_id = request.data.get('id')
        if not steam_id:
            return Response({"error": "ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        data = self.search_dota(steam_id)
        return Response(data, status=status.HTTP_200_OK)

#Riot
class SearchMatchesRiot(APIView):
    
    @staticmethod
    def search_riot(region, match_id):
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

        result = []
        for p in participants:
            puuid = p.get("puuid")
            challenges = p.get("challenges", {})
            teamPosition = p.get("teamPosition", "")

            if teamPosition == "":
                teamPosition = "ARAM"

            result.append({
                "puuid": puuid,
                "playerName": p.get("riotIdGameName"),
                "tagLine": p.get("riotIdTagline"),
                "goldPerMinute": challenges.get("goldPerMinute"),
                "controlWardsPlaced": p.get("controlWardsPlaced"),
                "firstTurretKilled": int(p.get("firstTurretKilled", False)),
                "gameEndedInSurrender": p.get("gameEndedInSurrender"),
                "kills": p.get("kills"),
                "deaths": p.get("deaths"),
                "assists": p.get("assists"),
                "championName": p.get("championName"),
                "lane": p.get("lane"),
                "teamPosition": teamPosition,
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

        details = self.search_riot(region, match_id)
        if details:
            return Response(details)
        else:
            return Response({'error': 'Erro ao buscar detalhes da partida.'}, status=status.HTTP_404_NOT_FOUND)

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
            details = SearchMatchesRiot.search_riot(region, match_id)
            if details:
                match_details.append(details)

        return Response({
            "puuid": puuid,
            "gameName": gameName,
            "tagLine": tagLine,
            "matches": match_details
        })