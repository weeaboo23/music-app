from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Artist, Album, Track , onlineTrack , Genre, Tag, Playlist, PlaylistItem , FavoriteTrack

class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = '__all__'


class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'


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
    

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = '__all__'



class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'




class TrackSerializer(serializers.ModelSerializer):
    genres = serializers.PrimaryKeyRelatedField(many=True, queryset=Genre.objects.all(), required=False)
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), required=False)

    class Meta:
        model = Track
        fields = ['id', 'title', 'file', 'duration', 'artist', 'album', 'uploaded_by', 'genres', 'tags','audio_file','stream_url']
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
            'stream_url': {'required': False},
        }






class OnlineTrackSerializer(serializers.ModelSerializer):
    genres = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Genre.objects.all(),
        required=False
    )
    tags = serializers.SlugRelatedField(
        many=True,
        slug_field='name',
        queryset=Tag.objects.all(),
        required=False
    )
    artist = serializers.CharField(required=False, allow_blank=True)
    album = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = onlineTrack
        fields = [
            'id', 'title', 'artist', 'album',
            'stream_url', 'thumbnail', 'source',
            'genres', 'tags'
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        user = self.context['request'].user

        validated_data.pop('user', None)

        genres_data = validated_data.pop('genres', [])
        tags_data = validated_data.pop('tags', [])
        artist_data = validated_data.pop('artist', None)
        album_data = validated_data.pop('album', None)

        artist = None
        if artist_data:
            artist, _ = Artist.objects.get_or_create(name=artist_data)

        album = None
        if album_data:
            album, _ = Album.objects.get_or_create(name=album_data)

        track = onlineTrack.objects.create(
            user=user,
            artist=artist,
            album=album,
            **validated_data
        )

        # Handle ManyToMany fields after instance is created
        for genre in genres_data:
            track.genres.add(genre)

        for tag in tags_data:
            track.tags.add(tag)

        return track




class PlaylistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaylistItem
        fields = ['id', 'playlist', 'track', 'online_track']


    def validate(self, data):
        track = data.get('track')
        online_track = data.get('online_track')
        if not track and not online_track:
            raise serializers.ValidationError("You must specify either a track or an online_track.")
        if track and online_track:
            raise serializers.ValidationError("You cannot specify both a track and an online_track.")
        return data


    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.track:
            rep['track_detail'] = TrackSerializer(instance.track).data
        elif instance.online_track:
            rep['online_track_detail'] = OnlineTrackSerializer(instance.online_track).data
        return rep
    
class PlaylistSerializer(serializers.ModelSerializer):
    items = PlaylistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ['id', 'user', 'name', 'created_at', 'items']
        read_only_fields = ['user', 'created_at', 'items']
        

class FavoriteTrackSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteTrack
        fields = ['id', 'user', 'track', 'online_track', 'favorited_at']
        read_only_fields = ['user', 'favorited_at']

    def validate(self, data):
        track = data.get('track')
        online_track = data.get('online_track')
        if not track and not online_track:
            raise serializers.ValidationError("You must provide either a track or an online_track.")
        if track and online_track:
            raise serializers.ValidationError("You can't favorite both a track and an online_track at the same time.")
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
