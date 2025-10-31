from django.urls import path
from .views import SearchSteam, SearchDota2, SearchRiot, SearchMatchesRiot

urlpatterns = [
    path('Search/', SearchSteam.as_view(), name='search_steam'),
    path('Dota2/', SearchDota2.as_view(), name='search_dota2'),
    path('Riot/', SearchRiot.as_view(), name='search_riot'),
    path('Match/', SearchMatchesRiot.as_view(), name='search_riot_match'),
]