import rest_framework.serializers as serializers

class SearchSteamResultSerializer(serializers.Serializer):
        player_name = serializers.CharField()

class SearchDota2ResultSerializer(serializers.Serializer):
        id = serializers.IntegerField()

class SearchRiotResultSerializer(serializers.Serializer):
    gameName = serializers.CharField()
    tagLine = serializers.CharField()
    region = serializers.ChoiceField(choices=[
        ('asia'),
        ('americas'),
        ('europa'),
    ])