from django.db import models
from django.contrib.auth.models import User

class Genre(models.Model):
    name = models.CharField(max_length=100)

class Tag(models.Model):
    name = models.CharField(max_length=100)

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
    genres = models.ManyToManyField(Genre , null=True , blank = True)
    tags = models.ManyToManyField(Tag, null = True, blank= True)
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
    genres = models.ManyToManyField(Genre , null=True , blank = True)
    tags = models.ManyToManyField(Tag, null = True, blank= True)

    
    

    def __str__(self):
        return self.title or self.file.name


