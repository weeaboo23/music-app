import React, { useEffect, useState } from 'react';
import axiosInstance from './axiosInstance';
import { motion } from 'framer-motion'; 

function PlaylistPage() {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylist, setNewPlaylist] = useState({ name: ''});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    try {
      const response = await axiosInstance.get('/api/playlists/');
      setPlaylists(response.data);
    } catch (err) {
      console.error('Error fetching playlists:', err);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      setError('Playlist name is required.');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/api/playlists/', newPlaylist),{
        name: newPlaylist.name,
      }
      setNewPlaylist({ name: '' });
      
      setError('');
      fetchPlaylists();
    } catch (err) {
      console.error('Error creating playlist:', err);
      setError('Could not create playlist.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

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
                <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/tracks'}>
                  My Music Library
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

      <h2 className="text-center mb-4">🎵 My Playlists</h2>

      <div className="card mb-4 p-3">
        <h5>Create New Playlist</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <input
          className="form-control mb-2"
          placeholder="Playlist Name"
          value={newPlaylist.name}
          onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
        />
        <button className="btn btn-primary" onClick={handleCreatePlaylist} disabled={loading}>
          {loading ? 'Creating...' : 'Create Playlist'}
        </button>
      </div>

      <div className="row g-4">
        {playlists.length === 0 ? (
          <p className="text-muted">No playlists yet. Create one above!</p>
        ) : (
          playlists.map((playlist) => (
            <div className="col-md-6 col-lg-4" key={playlist.id}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{playlist.name}</h5>
                  <p className="card-text">{playlist.description || 'No description.'}</p>
                  <button
                    className="btn btn-outline-primary mt-auto"
                    onClick={() => (window.location.href = `/playlist/${playlist.id}`)}
                  >
                    View Tracks
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlaylistPage;
