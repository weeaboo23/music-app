from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArtistViewSet, AlbumViewSet, TrackViewSet , UserViewSet , RegisterView ,SongSearchView , onlineTrackViewSet

router = DefaultRouter()
router.register(r'artists', ArtistViewSet)
router.register(r'albums', AlbumViewSet)
router.register(r'tracks', TrackViewSet)
router.register(r'users', UserViewSet)
router.register(r'online-tracks', onlineTrackViewSet, basename='online-track')




urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path("search/", SongSearchView.as_view(), name="song-search")
    
]
