from django.contrib import admin
from .models import Track, Tag, Genre ,Artist ,Album , onlineTrack

admin.site.register(Track)
admin.site.register(Tag)
admin.site.register(Genre)
admin.site.register(Artist)
admin.site.register(Album)
admin.site.register(onlineTrack)

