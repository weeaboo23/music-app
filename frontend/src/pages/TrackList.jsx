import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './TrackList.css';
import axiosInstance from './axiosInstance';
import { motion } from 'framer-motion';

function TrackList() {
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [onlineTracks, setOnlineTracks] = useState([]);
  const [search, setSearch] = useState('');
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedTrackToAdd, setSelectedTrackToAdd] = useState(null);

  const audioRefs = useRef({});
  const token = localStorage.getItem('token');

  const fetchAllTracks = async (url, useAuth = false) => {
    const results = [];
    let next = url;

    while (next) {
      const response = await (useAuth ? axiosInstance : axios).get(next, {
        headers: { Authorization: `Bearer ${token}` }
      });
      results.push(...response.data.results);
      next = response.data.next;
    }

    return results;
  };

  const fetchTracks = async () => {
    try {
      const [uploaded, online] = await Promise.all([
        fetchAllTracks(`http://localhost:8000/api/tracks/?search=${search}`, true),
        fetchAllTracks(`http://localhost:8000/api/online-tracks/?search=${search}`, false)
      ]);

      setUploadedTracks(uploaded);
      setOnlineTracks(online);
    } catch (err) {
      console.error('Error fetching tracks:', err);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const res = await axiosInstance.get('http://localhost:8000/api/playlists/');
      setPlaylists(res.data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
  }, [search]);

  const handlePlayPause = (trackId, isOnline = false) => {
    Object.entries(audioRefs.current).forEach(([id, audio]) => {
      if (id !== trackId && audio) audio.pause();
    });

    const currentAudio = audioRefs.current[trackId];
    if (currentAudio) {
      if (currentAudio.paused) {
        currentAudio.play();
        setPlayingTrackId(trackId);
      } else {
        currentAudio.pause();
        setPlayingTrackId(null);
      }
    }
  };

  const handleDelete = async (id, isOnline = false) => {
    try {
      const url = isOnline
        ? `http://localhost:8000/api/online-tracks/${id}/`
        : `http://localhost:8000/api/tracks/${id}/`;

      await axiosInstance.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTracks();
    } catch (err) {
      console.error('Error deleting track:', err);
    }
  };

  const handleFavorite = async (track, isOnline = false) => {
    try {
      const payload = isOnline
        ? { online_track: track.id }
        : { track: track.id };

      await axiosInstance.post('http://localhost:8000/api/favorites/', payload)
      alert(`Added "${track.title}" to favorites!`);
    } catch (err) {
      console.error('Error adding favorite:', err);
    }
  };

  const handleAddToPlaylist = (track, isOnline = false) => {
    setSelectedTrackToAdd({ track, isOnline });
  };

  const confirmAddToPlaylist = async (playlistId) => {
    try {
      const { track, isOnline } = selectedTrackToAdd;
      const payload = isOnline
        ? { online_track: track.id, playlist: playlistId }
        : { track: track.id, playlist: playlistId };

      await axiosInstance.post('api/playlist-items/', payload);
      alert(`Added "${track.title}" to playlist successfully!`);
      setSelectedTrackToAdd(null);
    } catch (err) {
      console.error('Error adding to playlist:', err);
      alert('Track may already be in the playlist or an error occurred.');
    }
  };

  const handleEdit = async () => {
    try {
      const updated = {
        ...editModal,
        tags: editModal.tags.split(',').map(tag => tag.trim()),
        genres: editModal.genres.split(',').map(g => g.trim())
      };
      await axiosInstance.patch(`http://localhost:8000/api/tracks/${editModal.id}/`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditModal(null);
      fetchTracks();
    } catch (err) {
      console.error('Error editing track:', err);
    }
  };

  return (
    <div className="container py-4">
      <motion.nav className="d-flex justify-content-between align-items-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/dashboard'}>
            Dashboard
          </button>
          <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/playlist'}>
            My Playlist
          </button>
          <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/upload'}>
            Upload Tracks
          </button>
          <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/search'}>
            Web Search
          </button>
        </div>
        <button className="btn btn-outline-danger" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('access');
          window.location.href = '/login';
        }}>
          Logout
        </button>
      </motion.nav>

      <h2 className="text-center mb-4">🎧 My Music Library</h2>

      <div className="row mb-3">
        <div className="col-md-10">
          <input
            type="text"
            className="form-control"
            placeholder="Search by title or artist"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button className="btn btn-dark" onClick={fetchTracks}>Search</button>
        </div>
      </div>

      <h4 className="mt-4">🎶 Uploaded Tracks</h4>
      <div className="row g-4 mb-5">
        {uploadedTracks.map(track => (
          <div className="col-md-6 col-lg-4" key={track.id}>
            <div className="card shadow-sm h-100">
              {track.cover_image && <img src={track.cover_image} className="card-img-top" alt={track.title} />}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{track.title}</h5>
                <p className="card-text">{track.artist} — {track.album}</p>
                <p className="text-muted small">Tags: {track.tags.join(', ')}</p>
                <p className="text-muted small">Genres: {track.genres.join(', ')}</p>
                <audio
                  ref={(el) => (audioRefs.current[track.id] = el)}
                  src={track.audio_file}
                  onPause={() => setPlayingTrackId(null)}
                />
                <div className="d-flex justify-content-between mt-auto pt-2 flex-wrap">
                  <button className="btn btn-outline-primary btn-sm me-1 mb-1" onClick={() => handlePlayPause(track.id)}>
                    {playingTrackId === track.id ? 'Pause' : 'Play'}
                  </button>

                  <button
                    className="btn btn-outline-success btn-sm me-1 mb-1"
                    onClick={() => handleAddToPlaylist(track, false)}
                  >
                    Add to Playlist
                  </button>

                  <button
                    className="btn btn-outline-warning btn-sm me-1 mb-1"
                    onClick={() => handleFavorite(track, false)}
                  >
                    Favorite
                  </button>

                  <div className="btn-group mb-1">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() =>
                        setEditModal({
                          ...track,
                          tags: track.tags.join(', '),
                          genres: track.genres.join(', ')
                        })
                      }
                    >
                      Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(track.id, false)}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h4 className="mt-4">🌐 Online Saved Tracks</h4>
      <div className="row g-4">
        {onlineTracks.map(track => (
          <div className="col-md-6 col-lg-4" key={track.id}>
            <div className="card shadow-sm h-100">
              {track.thumbnail && <img src={track.thumbnail} className="card-img-top" alt={track.title} />}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{track.title}</h5>
                <p className="card-text">{track.artist?.name || 'Unknown Artist'} — {track.album?.name || ''}</p>
                <p className="text-muted small">Tags: {track.tags?.map(t => t.name).join(', ')}</p>
                <p className="text-muted small">Genres: {track.genres?.map(g => g.name).join(', ')}</p>
                <audio
                  ref={(el) => (audioRefs.current[`online-${track.id}`] = el)}
                  src={track.stream_url}
                  onPause={() => setPlayingTrackId(null)}
                />
                <div className="d-flex justify-content-between mt-auto pt-2 flex-wrap">
                  <button
                    className="btn btn-outline-primary btn-sm me-1 mb-1"
                    onClick={() => handlePlayPause(`online-${track.id}`, true)}
                  >
                    {playingTrackId === `online-${track.id}` ? 'Pause' : 'Play'}
                  </button>

                  <button
                    className="btn btn-outline-success btn-sm me-1 mb-1"
                    onClick={() => handleAddToPlaylist(track, true)}
                  >
                    Add to Playlist
                  </button>

                  <button
                    className="btn btn-outline-warning btn-sm me-1 mb-1"
                    onClick={() => handleFavorite(track, true)}
                  >
                    Favorite
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm mb-1"
                    onClick={() => handleDelete(track.id, true)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTrackToAdd && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Playlist</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTrackToAdd(null)}></button>
              </div>
              <div className="modal-body">
                {playlists.length === 0 ? (
                  <p>No playlists found.</p>
                ) : (
                  playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      className="btn btn-outline-primary w-100 mb-2"
                      onClick={() => confirmAddToPlaylist(playlist.id)}
                    >
                      {playlist.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Track</h5>
                <button type="button" className="btn-close" onClick={() => setEditModal(null)}></button>
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" value={editModal.title} onChange={(e) => setEditModal({ ...editModal, title: e.target.value })} placeholder="Title" />
                <input className="form-control mb-2" value={editModal.artist} onChange={(e) => setEditModal({ ...editModal, artist: e.target.value })} placeholder="Artist" />
                <input className="form-control mb-2" value={editModal.album} onChange={(e) => setEditModal({ ...editModal, album: e.target.value })} placeholder="Album" />
                <input className="form-control mb-2" value={editModal.tags} onChange={(e) => setEditModal({ ...editModal, tags: e.target.value })} placeholder="Tags (comma separated)" />
                <input className="form-control" value={editModal.genres} onChange={(e) => setEditModal({ ...editModal, genres: e.target.value })} placeholder="Genres (comma separated)" />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleEdit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackList;
