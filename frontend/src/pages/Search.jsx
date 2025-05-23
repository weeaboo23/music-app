import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaStar, FaRegStar } from 'react-icons/fa';
import axiosIns from './axiosInstance';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const audioRefs = useRef({});
  const iframeRefs = useRef({});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const cachedQuery = localStorage.getItem('recentSearch');
    const cachedFavorites = localStorage.getItem('favorites');
    if (cachedQuery) setQuery(cachedQuery);
    if (cachedFavorites) setFavorites(JSON.parse(cachedFavorites));
  }, []);

  

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    localStorage.setItem('recentSearch', query);
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/search/?q=${encodeURIComponent(query)}`);
      const allResults = res.data.results || [];
      const playable = allResults.filter(item => item.stream_url && item.source !== 'youtube' && item.source !== 'mixcloud');
      const embeddable = allResults.filter(item => !playable.includes(item));
      setResults([...playable, ...embeddable]);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
    setLoading(false);
    setQuery('');
    localStorage.removeItem('recentSearch');
  };

  const toggleFavorite = (item) => {
    const updated = favorites.some(f => f.stream_url === item.stream_url)
      ? favorites.filter(f => f.stream_url !== item.stream_url)
      : [...favorites, item];
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const stopAllPlayers = (currentId) => {
    setActiveId(currentId);
    Object.entries(audioRefs.current).forEach(([id, el]) => {
      if (id !== currentId && el?.pause) {
        el.pause();
        el.currentTime = 0;
      }
    });
    Object.entries(iframeRefs.current).forEach(([id, iframe]) => {
      if (id !== currentId && iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'stopVideo', args: [] }),
          '*'
        );
        iframe.contentWindow.postMessage(
          JSON.stringify({ method: 'pause' }),
          '*'
        );
      }
    });
  };

const handleAddToLibrary = async (item) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axiosIns.post("http://localhost:8000/api/online-tracks/", {
      title: item.title,
      stream_url: item.stream_url,
      thumbnail: item.thumbnail,
      source: item.source,
      artist: item.artist_id || null,
      album: item.album_id || null,
      genres: item.genres || [],
      tags: item.tags || []
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    alert("Track added to your library!");
  } catch (error) {
    if (error.response && error.response.status === 400 && error.response.data.detail?.includes("already exists")) {
      alert("Track already in your library.");
    } else {
      console.error("Add to Library failed:", error.response?.data || error);
      alert("Failed to add track.");
    }
  }
};

  const getEmbeddedPlayer = (item, id) => {
    if (item.source === 'youtube') {
      const videoId = new URL(item.stream_url).searchParams.get('v');
      return (
        <div className="ratio ratio-16x9 mt-3">
          <iframe
            ref={(el) => (iframeRefs.current[id] = el)}
            title={item.title}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            frameBorder="0"
            onClick={() => stopAllPlayers(id)}
          />
        </div>
      );
    }

    if (item.source === 'mixcloud') {
      const path = item.stream_url.replace('https://www.mixcloud.com', '');
      return (
        <div className="ratio ratio-16x9 mt-3">
          <iframe
            ref={(el) => (iframeRefs.current[id] = el)}
            title={item.title}
            src={`https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=${path}`}
            allow="autoplay"
            allowFullScreen
            frameBorder="0"
            onClick={() => stopAllPlayers(id)}
          />
        </div>
      );
    }

    return (
      <audio
        controls
        className="w-100 mt-3"
        ref={(el) => (audioRefs.current[id] = el)}
        onPlay={() => stopAllPlayers(id)}
      >
        <source src={item.stream_url} type="audio/mpeg" />
      </audio>
    );
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(results.length / itemsPerPage);

  const renderPagination = () => (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">
        {[...Array(totalPages)].map((_, i) => (
          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
            <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
              {i + 1}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );

  const renderCards = (items) => (
    items.map((item, idx) => {
      const id = `${item.source}-${currentPage}-${idx}`;
      const isFav = favorites.some(f => f.stream_url === item.stream_url);
      return (
        <div className="col-12 col-md-6 col-lg-4 mb-4" key={id}>
          <div className="card shadow-sm border-0 h-100">
            <img
              src={item.thumbnail}
              className="card-img-top object-fit-cover"
              alt={item.title}
              style={{ height: '200px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-truncate">{item.title}</h5>
              <p className="text-muted mb-2">{item.artist}</p>
              {getEmbeddedPlayer(item, id)}
              <div className="mt-auto d-flex justify-content-between align-items-center mt-3">
                <button
                  className={`btn ${isFav ? 'btn-warning' : 'btn-outline-secondary'}`}
                  onClick={() => toggleFavorite(item)}
                >
                  {isFav ? <FaStar /> : <FaRegStar />} {isFav ? 'Remove' : 'Favorite'}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => handleAddToLibrary(item)}>ADD TO LIBRARY</button>
              </div>
            </div>
          </div>
        </div>
      );
    })
  );

  return (
    <div className="container py-5">
      <nav className="d-flex justify-content-between align-items-center mb-4">
  <div>
    <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/dashboard'}>
      Dashboard
    </button>
    <button className="btn btn-outline-secondary me-2" onClick={() => window.location.href = '/tracks'}>
      My Music Library  
    </button>
  </div>
  <button
    className="btn btn-outline-danger"
    onClick={() => {
      localStorage.removeItem('token');
      localStorage.removeItem('access');
      window.location.href = '/login';
    }}
  >
    Logout
  </button>
</nav>
      <div className="row justify-content-center mb-5">
        <div className="col-md-10 col-lg-8">
          <form onSubmit={handleSearch}>
            <div className="input-group shadow-sm">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search songs, artists, albums..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary btn-lg" type="submit">
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
      </div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Searching...</p>
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center text-muted">
          <p>No results found for <strong>{query}</strong></p>
        </div>
      )}

      {!loading && paginatedResults.length > 0 && (
        <>
          <div className="row">{renderCards(paginatedResults)}</div>
          {renderPagination()}
        </>
      )}

      {favorites.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-4">★ Your Favorites</h4>
          <div className="row">
            {renderCards(favorites)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;

