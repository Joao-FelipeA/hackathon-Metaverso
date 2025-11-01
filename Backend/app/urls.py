from django.urls import path
from .views import SearchSteam, SearchDota2, SearchRiot

urlpatterns = [
    path('Steam/Steam_Search/', SearchSteam.as_view(), name='search_steam'),
    path('Steam/Dota_Search/', SearchDota2.as_view(), name='search_dota2'),
    path('Riot/Riot_Search/', SearchRiot.as_view(), name='search_riot')
]