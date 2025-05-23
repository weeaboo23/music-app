from rest_framework import viewsets, permissions, generics
from rest_framework.parsers import MultiPartParser, FormParser ,JSONParser  
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from django_filters import rest_framework as filters

from django.contrib.auth.models import User 

from .models import Artist, Album, Track , onlineTrack
from .serializers import ArtistSerializer,AlbumSerializer,TrackSerializer,UserSerializer,RegisterSerializer,OnlineTrackSerializer
from .search import search_youtube, search_jamendo, search_mixcloud ,search_audius


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


# --- Track Pagination ---

from rest_framework.pagination import PageNumberPagination

class TrackPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


# --- Track Filtering ---

class TrackFilter(FilterSet):
    genres = filters.CharFilter(field_name='genres__name', lookup_expr='icontains')
    tags = filters.CharFilter(field_name='tags__name', lookup_expr='icontains')

    class Meta:
        model = Track
        fields = ['genres', 'tags', 'uploaded_by']




class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    pagination_class = TrackPagination
    filterset_class = TrackFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'artist__name', 'album__title']
    ordering_fields = ['title', 'duration', 'artist__name']


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
    
class OnlineTrackFilter(FilterSet):
    class Meta:
        model = onlineTrack
        fields = ['title', 'artist','album', 'source', 'user','genres', 'tags','stream_url','thumbnail']

class onlineTrackViewSet(viewsets.ModelViewSet):

    queryset = onlineTrack.objects.all() 
    serializer_class = OnlineTrackSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser , JSONParser]
    pagination_class = TrackPagination
    filterset_class = OnlineTrackFilter
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'artist__name', 'album__title']
    ordering_fields = ['title', 'duration', 'artist__name']

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
            return  # don't save duplicate

        serializer.save(user=self.request.user)

