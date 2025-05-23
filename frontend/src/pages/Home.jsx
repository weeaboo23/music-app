// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-wrapper">
      <section className="hero-section">
        <div className="overlay">
          <div className="hero-content text-center text-white">
            <h1 className="display-3 fw-bold">Welcome to MusicApp</h1>
            <p className="lead mb-4">Discover, Stream, and Enjoy Music Anytime</p>
            <div>
              <Link to="/Login" className="btn btn-primary btn-lg me-3">Login</Link>
              <Link to="/Register" className="btn btn-outline-light btn-lg">Create Your Account</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;


