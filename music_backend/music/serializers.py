from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Artist, Album, Track , onlineTrack

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'

class TrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Track
        fields = ['id', 'title', 'file', 'duration', 'artist', 'album', 'uploaded_by', 'genres', 'tags','audio_file']
        extra_kwargs = {
            'title': {'required': False},
            'file': {'required': False},
            'duration': {'required': False},
            'artist': {'required': False},
            'album': {'required': False},
            'uploaded_by': {'required': False},
            'genres': {'required': False},
            'tags': {'required': False},
            'audio_file': {'required': False},
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class OnlineTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = onlineTrack 
        fields = ['id', 'title', 'artist', 'album', 'stream_url', 'thumbnail', 'source']
        extra_kwargs = {
            'title': {'required': False},
            'artist': {'required': False},
            'album': {'required': False},
            'stream_url': {'required': False},
            'thumbnail': {'required': False},
            'source': {'required': False},
            'genres': {'required': False},
            'tags': {'required': False},
        } 
        
        