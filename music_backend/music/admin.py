from django.contrib import admin
from .models import Track, Tag, Genre ,Artist ,Album , onlineTrack ,Playlist, PlaylistItem ,FavoriteTrack

admin.site.register(Track)
admin.site.register(Tag)
admin.site.register(Genre)
admin.site.register(Artist)
admin.site.register(Album)
admin.site.register(onlineTrack)
admin.site.register(Playlist)
admin.site.register(PlaylistItem)       
admin.site.register(FavoriteTrack)  

