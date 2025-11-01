from django.db import models
from django.contrib.auth.models import User

class User(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email = models.EmailField(unique=True)
    senha = models.CharField(max_length=128)
    preferences = models.ForeignKey('UserPreferences', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.user.username
    
class UserPreferences(models.Model):
    dark_mode = models.BooleanField(default=False)

    def __str__(self):
        return f"Preferences for {self.id}"