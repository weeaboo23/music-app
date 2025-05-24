from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

class Genre(models.Model):
    name = models.CharField(max_length=100 ,unique = True)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=100 ,unique = True)  

    def __str__(self):
        return self.name


class Artist(models.Model):
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name



class Album(models.Model):
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    release_date = models.DateField()

    def __str__(self):
        return self.title





class Track(models.Model):
    title = models.CharField(max_length=255 , blank=True, null=True)
    artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, null=True, blank=True)
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True)
    file = models.FileField(upload_to='tracks/',blank=True, null=True)
    duration = models.DurationField(blank=True, null=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank =True)
    genres = models.ManyToManyField(Genre , blank = True)
    tags = models.ManyToManyField(Tag, blank= True)
    created_at = models.DateTimeField(auto_now_add=True)
    audio_file = models.FileField(upload_to='tracks/',null=True,blank=True,max_length=255)
    stream_url = models.URLField(blank=True, null=True,default=None)  

    def __str__(self):
        return self.title or self.file.name


class onlineTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.SET_NULL, null=True, blank=True)
    album = models.ForeignKey(Album, on_delete=models.SET_NULL, null=True, blank=True)
    stream_url = models.URLField(blank=True, null=True,default=None)
    thumbnail = models.URLField(blank=True, null=True,default=None)
    source = models.CharField(max_length=255, blank=True, null=True)
    saved_at = models.DateTimeField(auto_now_add=True)
    genres = models.ManyToManyField(Genre , blank = True)
    tags = models.ManyToManyField(Tag, blank= True)

    def __str__(self):
        return self.title or self.stream_url or "untitled"

class Playlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"

class PlaylistItem(models.Model):
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE, related_name='items')
    track = models.ForeignKey(Track, null=True, blank=True, on_delete=models.CASCADE)
    online_track = models.ForeignKey(onlineTrack, null=True, blank=True, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['playlist', 'track', 'online_track'],
                name='unique_playlist_track_combination'
            )
        ]

    def clean(self):
        if not self.track and not self.online_track:
            raise ValidationError("Either a track or an online track must be set.")
        if self.track and self.online_track:
            raise ValidationError("Only one of track or online track can be set.")

    def save(self, *args, **kwargs):
        self.clean()  # ensure constraints before saving
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.playlist.name} item: {self.track or self.online_track}"



class FavoriteTrack(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, null=True, blank=True, on_delete=models.CASCADE)
    online_track = models.ForeignKey(onlineTrack, null=True, blank=True, on_delete=models.CASCADE)
    favorited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'track', 'online_track')

    def clean(self):
        if not self.track and not self.online_track:
            raise ValidationError("Either a track or online_track must be set.")
        if self.track and self.online_track:
            raise ValidationError("You can't favorite both track and online_track in one record.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} favorited: {self.track or self.online_track}"
