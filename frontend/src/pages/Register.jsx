import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/api/register/', {
        username,
        password,
      });
      alert('Registration successful! Please login.');
      navigate('/Login');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <h2>Create Your Account</h2>
        <form onSubmit={handleRegister} className="register-form">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            id="username"
            className="form-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter username"
            disabled={loading}
            autoComplete="username"
          />

          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            disabled={loading}
            autoComplete="new-password"
            minLength={6}
          />

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center">
          Already have an account?{' '}
          <Link to="/Login" className="link-login">Login</Link>
        </p>
      </div>

      <style>{`
        .register-wrapper {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea, #764ba2);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }
        .register-box {
          background: #fff;
          padding: 40px 35px;
          border-radius: 12px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
          animation: fadeInUp 0.6s ease forwards;
        }
        h2 {
          margin-bottom: 25px;
          color: #4a4a4a;
          font-weight: 700;
          font-size: 1.8rem;
          letter-spacing: 1px;
        }
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
        }
        .form-label {
          font-weight: 600;
          margin-bottom: 6px;
          color: #555;
        }
        .form-input {
          padding: 12px 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }
        .form-input:focus {
          border-color: #667eea;
          outline: none;
          box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
        }
        .btn-submit {
          margin-top: 10px;
          background: #667eea;
          color: white;
          font-weight: 700;
          padding: 14px 0;
          border: none;
          border-radius: 10px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
          box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
        .btn-submit:disabled {
          background: #a3a3a3;
          cursor: not-allowed;
          box-shadow: none;
        }
        .btn-submit:hover:not(:disabled) {
          background: #5a6ad9;
        }
        .error-msg {
          color: #e74c3c;
          font-weight: 600;
          font-size: 0.9rem;
          margin-top: -10px;
          margin-bottom: 8px;
          text-align: center;
        }
        .text-center {
          margin-top: 18px;
          font-size: 0.95rem;
          color: #666;
        }
        .link-login {
          color: #667eea;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .link-login:hover {
          color: #4558c9;
          text-decoration: underline;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 480px) {
          .register-box {
            padding: 30px 25px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Register;

