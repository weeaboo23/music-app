import requests
import os
from dotenv import load_dotenv
load_dotenv()


YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
JAMENDO_CLIENT_ID = os.getenv("JAMENDO_CLIENT_ID")
MIXCLOUD_CLIENT_ID = os.getenv("MIXCLOUD_CLIENT_ID")

def search_youtube(query):
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "key": YOUTUBE_API_KEY,
        "maxResults": 5,
        "type": "video"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return []

    data = response.json()
    results = []

    for item in data.get("items", []):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]
        results.append({
            "title": snippet["title"],
            "artist": snippet.get("channelTitle", ""),
            "stream_url": f"https://www.youtube.com/watch?v={video_id}",
            "thumbnail": snippet["thumbnails"]["default"]["url"],
            "source": "youtube"
        })

    return results


def search_jamendo(query):
    url = "https://api.jamendo.com/v3.0/tracks"
    params = {
        "client_id": JAMENDO_CLIENT_ID,
        "format": "json",
        "limit": 5,
        "search": query,
        "audioformat": "mp31"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return []

    data = response.json()
    results = []

    for track in data.get("results", []):
        results.append({
            "title": track["name"],
            "artist": track["artist_name"],
            "stream_url": track["audio"],
            "thumbnail": track["album_image"],
            "source": "jamendo"
        })

    return results


def search_mixcloud(query):
    url = f"https://api.mixcloud.com/search/"
    params = {
        "q": query,
        "type": "cloudcast"
    }
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return []

    data = response.json()
    results = []

    for item in data.get("data", [])[:5]:
        results.append({
            "title": item["name"],
            "artist": item["user"]["name"],
            "stream_url": item["url"],
            "thumbnail": item["pictures"]["thumbnail"],
            "source": "mixcloud"
        })

    return results

import requests

def search_audius(query):
    search_url = "https://api.audius.co/v1/tracks/search"
    params = {
        "query": query,
        "app_name": "music-app"
    }

    try:
        response = requests.get(search_url, params=params)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print("Audius search error:", e)
        return []

    results = []

    for track in data.get("data", [])[:5]:
        # Construct streamable URL using `id`
        track_id = track.get("id")
        stream_url = f"https://api.audius.co/v1/tracks/{track_id}/stream" if track_id else None

        if not stream_url:
            continue  # skip if stream_url couldn't be built

        results.append({
            "title": track.get("title", "Unknown Title"),
            "artist": track.get("user", {}).get("name", "Unknown Artist"),
            "stream_url": stream_url,
            "thumbnail": track.get("artwork", {}).get("150x150", ""),
            "source": "audius"
        })

    return results
