import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
      });
      alert('Registration successful! Please login.');
      navigate('/Login');
    } catch (err) {
      alert('Registration failed');
      console.error(err);
    }
  };

   return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="login-box shadow-lg rounded-4 p-5 bg-white">
        <h2 className="text-center mb-4">Create Account</h2>
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-success btn-lg">Register</button>
          </div>
          <div className="text-center">
            <small className="text-muted">Already have an account? <Link to="/Login">Login</Link></small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
