import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import UploadTrack from './pages/UploadTrack';
import Register from './pages/Register';
import TrackList from './pages/TrackList';
import Search from './pages/Search';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PlaylistPage from './pages/PlayList';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Login" element={<Login /> } />
        <Route path="/register" element={<Register />} />
        <Route path="/upload" element={<UploadTrack />} />
        <Route path="/tracks" element={<TrackList />} />
        <Route path="/search" element={<Search />} />
        <Route path="/playlist" element={<PlaylistPage />} />
      </Routes>
    </Router>
  );
}

export default App;



