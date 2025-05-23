import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./UploadTrack.css";
import { Link } from 'react-router-dom';
import axiosInstance from './axiosInstance';

function UploadTrack() {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const token = localStorage.getItem('token');


  // Fetch artists and albums for dropdowns
  useEffect(() => {
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}`
                            } };

    axiosInstance.get('http://localhost:8000/api/artists/', config)
      .then(res => setArtists(res.data))
      .catch(err => console.error('Error fetching artists:', err));

    axiosInstance.get('http://localhost:8000/api/albums/', config)
      .then(res => setAlbums(res.data))
      .catch(err => console.error('Error fetching albums:', err));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('audio_file', audioFile);
    formData.append('artist', artist);
    formData.append('album', album);

    try {
      const res = await axiosInstance.post('http://localhost:8000/api/tracks/', formData, {
        headers: { 'Authorization': `Bearer ${token}`,
                               'Content-Type': 'multipart/form-data',
                            } 
      });
      alert('Track uploaded!');
    } catch (err) {
      console.error(err.response?.data || err);
      alert('Upload failed');
      console.log(localStorage.getItem('token')) 
    }
  };

 return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-5">
              <h3 className="card-title text-center mb-4 text-primary">🎶 Upload New Track</h3>

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
                  >
                    <option value="">Select Artist</option>
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
                    <option value="">Select Album</option>
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
                </div>

                <div className="d-grid">
                  <button className="btn btn-primary btn-lg" type="submit">
                    🚀 Upload Track
                  </button>
                </div>
                 <div className='d-flex justify-content-between mt-4'>
                  <Link to="/tracks" className="btn btn-primary btn-lg me-3">Library</Link>
                  <Link to="/dashboard" className="btn btn-primary btn-lg me-3">DashBoard</Link>
                  <Link to="/search" className="btn btn-primary btn-lg me-3">Web Search</Link>
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

