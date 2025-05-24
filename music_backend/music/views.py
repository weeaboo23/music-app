from rest_framework import viewsets, permissions, generics
from rest_framework.parsers import MultiPartParser, FormParser ,JSONParser  
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from django_filters import rest_framework as filters
from rest_framework.exceptions import ValidationError , PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import action

from django.contrib.auth.models import User 

from .models import Artist, Album, Track , onlineTrack , Genre, Tag ,PlaylistItem, Playlist ,FavoriteTrack
from .serializers import ArtistSerializer,AlbumSerializer,TrackSerializer,UserSerializer,RegisterSerializer,OnlineTrackSerializer,GenreSerializer,TagSerializer , PlaylistItemSerializer, PlaylistSerializer , FavoriteTrackSerializer
from .search import search_youtube, search_jamendo, search_mixcloud ,search_audius

# --- Pagination ---
class TrackPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50

# --- Filterings ---

class TrackFilter(FilterSet):
    genres = filters.CharFilter(field_name='genres__name', lookup_expr='icontains')
    tags = filters.CharFilter(field_name='tags__name', lookup_expr='icontains')

    class Meta:
        model = Track
        fields = ['genres', 'tags', 'uploaded_by']

class OnlineTrackFilter(FilterSet):
    class Meta:
        model = onlineTrack
        fields = ['title', 'artist','album', 'source', 'user','genres', 'tags','stream_url','thumbnail']



# --- ViewSets ---

class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer


class AlbumViewSet(viewsets.ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = TrackPagination
    filterset_class = TrackFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'artist', 'album']
    ordering_fields = ['title', 'duration', 'artist']


    def perform_update(self, serializer):
        if self.get_object().uploaded_by != self.request.user:
            raise PermissionDenied("You do not have permission to edit this track.")
        serializer.save()

class onlineTrackViewSet(viewsets.ModelViewSet):

    queryset = onlineTrack.objects.all() 
    serializer_class = OnlineTrackSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser , JSONParser]
    pagination_class = TrackPagination
    filterset_class = OnlineTrackFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'artist', 'album']
    ordering_fields = ['title', 'artist']

    def get_queryset(self):
        return onlineTrack.objects.filter(user=self.request.user)
    
    
    def perform_create(self, serializer):
        # Prevent duplicates: check if this track already exists
        existing = onlineTrack.objects.filter(
            user=self.request.user,
            title=serializer.validated_data.get("title"),
            source=serializer.validated_data.get("source")
        ).first()

        if existing:
            raise ValidationError("Track already saved.")

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if self.get_object().user != self.request.user:
            raise PermissionDenied("You do not have permission to edit this online track.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user != request.user:
            return Response({"detail": "Not allowed to delete this item."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)



class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer



class PlaylistViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        playlist = self.get_object()
        if playlist.user != request.user:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        playlist = self.get_object()
        items = PlaylistItem.objects.filter(playlist=playlist)
        serializer = PlaylistItemSerializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_track(self, request, pk=None):
        playlist = self.get_object()
        track_id = request.data.get('track_id')
        online_track_id = request.data.get('online_track_id')

        if not track_id and not online_track_id:
            return Response({"detail": "Provide either track_id or online_track_id."},
                            status=status.HTTP_400_BAD_REQUEST)

        item = PlaylistItem(playlist=playlist)

        if track_id:
            try:
                item.track = Track.objects.get(id=track_id, user=request.user)
            except Track.DoesNotExist:
                return Response({"detail": "Track not found."}, status=status.HTTP_404_NOT_FOUND)
        elif online_track_id:
            try:
                item.online_track = OnlineTrack.objects.get(id=online_track_id, user=request.user)
            except OnlineTrack.DoesNotExist:
                return Response({"detail": "OnlineTrack not found."}, status=status.HTTP_404_NOT_FOUND)

        item.save()
        return Response({"detail": "Track added to playlist."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def remove_track(self, request, pk=None):
        playlist = self.get_object()
        track_id = request.data.get('track_id')
        online_track_id = request.data.get('online_track_id')

        items = PlaylistItem.objects.filter(playlist=playlist)
        if track_id:
            items = items.filter(track_id=track_id)
        elif online_track_id:
            items = items.filter(online_track_id=online_track_id)
        else:
            return Response({"detail": "Provide track_id or online_track_id to remove."},
                            status=status.HTTP_400_BAD_REQUEST)

        deleted, _ = items.delete()
        return Response({"detail": f"{deleted} item(s) removed from playlist."}, status=status.HTTP_200_OK)



class PlaylistItemViewSet(viewsets.ModelViewSet):
    serializer_class = PlaylistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PlaylistItem.objects.filter(playlist__user=self.request.user)

    def perform_create(self, serializer):
        playlist = serializer.validated_data['playlist']
        if playlist.user != self.request.user:
            raise PermissionDenied("Cannot add items to a playlist you don't own.")
        serializer.save()

    def perform_update(self, serializer):  # [ADDED]: Secures updates only for owner
        playlist = serializer.validated_data.get('playlist') or self.get_object().playlist
        if playlist.user != self.request.user:
            raise PermissionDenied("Cannot update items in a playlist you don't own.")
        serializer.save()


class FavoriteTrackViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteTrackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoriteTrack.objects.filter(user=self.request.user)

# --- Unified Song Search API ---

from rest_framework.views import APIView

class SongSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        query = request.query_params.get("q")
        if not query:
            return Response({"error": "Query parameter is required"}, status=400)

        yt_results = search_youtube(query)
        jamendo_results = search_jamendo(query)
        mixcloud_results = search_mixcloud(query)
        audios_results = search_audius(query)

        return Response({
            "results": yt_results + jamendo_results + mixcloud_results + audios_results,
        })
    


