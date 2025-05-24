import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';
import { Link } from 'react-router-dom';
import './UploadTrack.css';

function UploadTrack() {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    axiosInstance.get('http://localhost:8000/api/artists/', config)
      .then(res => setArtists(res.data))
      .catch(err => console.error('Error fetching artists:', err));

    axiosInstance.get('http://localhost:8000/api/albums/', config)
      .then(res => setAlbums(res.data))
      .catch(err => console.error('Error fetching albums:', err));
  }, [token]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio_file', audioFile);
    formData.append('artist', artist);
    formData.append('album', album);

    try {
      await axiosInstance.post('http://localhost:8000/api/tracks/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('🎉 Track uploaded successfully!');
      setTitle('');
      setAudioFile(null);
      setArtist('');
      setAlbum('');
    } catch (err) {
      setError('❌ Upload failed. Please check your input or try again.');
      console.error(err.response?.data || err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mt-5 upload-track-container">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="card-title text-center mb-4 text-primary">🎶 Upload a New Track</h3>

              {message && <div className="alert alert-success text-center">{message}</div>}
              {error && <div className="alert alert-danger text-center">{error}</div>}

              <form onSubmit={handleUpload}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Track Title</label>
                  <input
                    className="form-control"
                    placeholder="Enter track title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Artist</label>
                  <select
                    className="form-select"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                  >
                    <option value="">🎤 Select Artist</option>
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Album</label>
                  <select
                    className="form-select"
                    value={album}
                    onChange={(e) => setAlbum(e.target.value)}
                  >
                    <option value="">💿 Select Album</option>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Audio File</label>
                  <input
                    className="form-control"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files[0])}
                    required
                  />
                  {audioFile && <small className="text-muted mt-1">📂 {audioFile.name}</small>}
                </div>

                <div className="d-grid">
                  <button className="btn btn-primary btn-lg" type="submit" disabled={isUploading}>
                    {isUploading ? "Uploading..." : "🚀 Upload Track"}
                  </button>
                </div>

                <hr className="my-4" />

                <div className="d-flex justify-content-between flex-wrap">
                  <Link to="/tracks" className="btn btn-outline-primary mt-2">🎧 Library</Link>
                  <Link to="/dashboard" className="btn btn-outline-secondary mt-2">📊 Dashboard</Link>
                  <Link to="/search" className="btn btn-outline-success mt-2">🔍 Web Search</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadTrack;
