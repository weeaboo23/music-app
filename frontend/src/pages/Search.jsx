import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from './axiosInstance';
import { FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [embedded, setEmbedded] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const audioRefs = useRef({});
  const iframeRefs = useRef({});
  const mixcloudPlayers = useRef({});
  const [activeId, setActiveId] = useState(null);
  const pageTopRef = useRef();

  useEffect(() => {
    const cachedQuery = localStorage.getItem('recentSearch');
    if (cachedQuery) setQuery(cachedQuery);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    localStorage.setItem('recentSearch', query);
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/search/?q=${encodeURIComponent(query)}`);
      const allResults = res.data.results || [];
      const playable = allResults.filter(item => item.stream_url && item.source !== 'youtube');
      const embeds = allResults.filter(item => item.source === 'youtube');
      setResults(playable);
      setEmbedded(embeds);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setEmbedded([]);
    }
    setLoading(false);
    setQuery('');
    localStorage.removeItem('recentSearch');
  };

  const stopAllPlayers = (currentId) => {
    setActiveId(currentId);
    Object.entries(audioRefs.current).forEach(([id, el]) => {
      if (id !== currentId && el?.pause) {
        el.pause();
        el.currentTime = 0;
      }
    });
    Object.entries(mixcloudPlayers.current).forEach(([id, player]) => {
      if (id !== currentId && player?.pause) {
        player.pause();
      }
    });
  };

  const handleAddToLibrary = async (item) => {
    try {
      const payload = {
        title: item.title,
        stream_url: item.stream_url,
        thumbnail: item.thumbnail,
        source: item.source,
        genres: item.genres || [],
        tags: item.tags || [],
      };
    if (item.artist_id) payload.artist = item.artist_id;
    if (item.album_id) payload.album = item.album_id;
    await axiosInstance.post("/api/online-tracks/", payload);
    alert("Track added to your library!");
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.detail?.includes("already exists")) {
      alert("Track already in your library.");
    } else {
      console.error("Add to Library failed:", error.response?.data || error);
      alert("Failed to add track.");
    }
  }
};


  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(results.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    pageTopRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderPagination = () => (
    <nav className="mt-4">
      <ul className="pagination justify-content-center">
        {[...Array(totalPages)].map((_, i) => (
          <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange(i + 1)}>
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
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="col-12 col-md-6 col-lg-4 mb-4" key={id}
        >
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

              {item.source === 'mixcloud' ? (
                <div className="ratio ratio-16x9 mt-3">
                  <iframe
                    ref={(el) => {
                      if (el && !mixcloudPlayers.current[id]) {
                        iframeRefs.current[id] = el;
                        const widget = window.Mixcloud.PlayerWidget(el);
                        mixcloudPlayers.current[id] = widget;
                        widget.ready.then(() => {
                          widget.events.play.on(() => stopAllPlayers(id));
                        });
                      }
                    }}
                    title={item.title}
                    src={`https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&feed=${item.stream_url.replace('https://www.mixcloud.com', '')}`}
                    allow="autoplay"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              ) : (
                <audio
                  controls
                  className="w-100 mt-3"
                  ref={(el) => (audioRefs.current[id] = el)}
                  onPlay={() => stopAllPlayers(id)}
                >
                  <source src={item.stream_url} type="audio/mpeg" />
                </audio>
              )}

              {item.source !== 'youtube' && item.source !== 'mixcloud' && (
                <div className="mt-auto d-flex justify-content-end align-items-center mt-3">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => handleAddToLibrary(item)}>
                    ADD TO LIBRARY
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    })
  );

  return (
    <div className="container py-5">
      <div ref={pageTopRef} />

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
          <button className="btn btn-outline-primary me-2" onClick={() => window.location.href = '/playlist'}>
            My Playlist
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

      <motion.div className="row justify-content-center mb-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}>
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
      </motion.div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2">Searching...</p>
        </div>
      )}

      {!loading && paginatedResults.length > 0 && (
        <>
          <h4 className="mb-4">Playable Tracks</h4>
          <div className="row">{renderCards(paginatedResults)}</div>
          {renderPagination()}
        </>
      )}

      {embedded.length > 0 && (
        <motion.div className="mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}>
          <h4 className="mb-4">🎞️ YouTube Results</h4>
          <div className="row">
            {embedded.map((item, idx) => {
              const id = `youtube-embed-${idx}`;
              return (
                <motion.div className="col-12 col-md-6 col-lg-4 mb-4"
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}>
                  <div className="card shadow-sm border-0 h-100">
                    <img
                      src={item.thumbnail}
                      className="card-img-top object-fit-cover"
                      alt={item.title}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title text-truncate">{item.title}</h5>
                      <p className="text-muted mb-3">{item.artist}</p>
                      <a
                        className="btn btn-outline-info mt-auto"
                        href={item.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Search;
