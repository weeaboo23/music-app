import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Music Lover';

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-music-app">
      <div className="overlay">
        <div className="top-bar container-fluid d-flex justify-content-between align-items-center py-3 px-4">
          <h2 className="text-white m-0 fw-light">Hi, <span className="fw-bold text-info">{username}</span> 🎧</h2>
          <button className="btn btn-outline-light rounded-pill px-4 py-2 btn-logout" onClick={logout}>
            <i className="fas fa-sign-out-alt me-2"></i> Logout
          </button>
        </div>

        <div className="dashboard-center text-start text-white px-5">
          <h1 className="mb-3 display-3 fw-bold">
            Welcome to <span className="text-gradient">MusicApp</span>
          </h1>
          <p className="lead mb-5 text-light">Your personal music hub — explore, upload, and enjoy</p>

          <div className="d-flex flex-column gap-4">
            <button className="dashboard-btn btn btn-primary text-start px-4 py-3 shadow" onClick={() => navigate('/tracks')}>
              <i className="fas fa-user-circle fa-lg me-3"></i> Music Library
            </button>
            <button className="dashboard-btn btn btn-success text-start px-4 py-3 shadow" onClick={() => navigate('/search')}>
              <i className="fas fa-globe fa-lg me-3"></i> Explore Web Songs
            </button>
            <button className="dashboard-btn btn btn-warning text-start px-4 py-3 shadow" onClick={() => navigate('/upload')}>
              <i className="fas fa-upload fa-lg me-3"></i> Upload Your Music
            </button>
             <button className="dashboard-btn btn btn-warning text-start px-4 py-3 shadow" onClick={() => navigate('/playlist')}>
              <i className="fas fa-upload fa-lg me-3"></i> PlayLists
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

