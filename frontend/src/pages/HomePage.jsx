import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import MemeCard from '../components/Meme/MemeCard';
import UserSearch from '../components/User/UserSearch';

const HomePage = () => {
  const { currentUser, token } = useAuth();
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (token) {
      fetchMemes();
    }
  }, [token]);

  const fetchMemes = async (reset = false) => {
    try {
      if (loading) return;
      
      setLoading(true);
      const skip = reset ? 0 : page * 10;
      
      const response = await axios.get(`https://memesharingplatform-backend.onrender.com/api/memes/feed?skip=${skip}&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const newMemes = response.data;
      
      if (newMemes.length < 10) {
        setHasMore(false);
      }
      
      setMemes(prev => {
        if (reset) return newMemes;
        
        // Create a Set of existing IDs for O(1) lookup
        const existingIds = new Set(prev.map(m => m._id));
        
        // Only add memes that don't already exist
        const uniqueNewMemes = newMemes.filter(meme => !existingIds.has(meme._id));
        
        return [...prev, ...uniqueNewMemes];
      });
      
      if (!reset) {
        setPage(prev => prev + 1);
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error('Error fetching memes:', error);
      toast.error('Failed to load memes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setHasMore(true);
    fetchMemes(true);
  };

  const handleLike = (memeId, isLiked) => {
    setMemes(prevMemes => 
      prevMemes.map(meme => 
        meme._id === memeId 
          ? { 
              ...meme, 
              liked_by_user: isLiked,
              likes_count: isLiked 
                ? (meme.likes_count || 0) + 1
                : Math.max((meme.likes_count || 0) - 1, 0)
            }
          : meme
      )
    );
  };

  const handleCommentAdded = (memeId, comment) => {
    setMemes(prevMemes => 
      prevMemes.map(meme => 
        meme._id === memeId 
          ? { 
              ...meme, 
              comments_count: (meme.comments_count || 0) + 1,
              recent_comments: meme.recent_comments 
                ? [comment, ...meme.recent_comments.slice(0, 1)]
                : [comment]
            }
          : meme
      )
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="sticky top-0 z-10 bg-white py-2 mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meme Feed</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition"
          >
            {showSearch ? 'Hide Search' : 'Search Users'}
          </button>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <UserSearch />
        </div>
      )}

      {!currentUser && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
          <h2 className="text-xl font-bold mb-2">Welcome to Meme Platform!</h2>
          <p className="mb-4">Sign up or log in to see and share memes with your friends.</p>
          <Link 
            to="/auth" 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Sign Up / Log In
          </Link>
        </div>
      )}

      {token && (
        <>
          {loading && memes.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : memes.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <h2 className="text-xl font-bold mb-2">No memes yet</h2>
              <p className="mb-4">Follow some users or upload your own memes to see content here.</p>
              <div className="flex justify-center space-x-4">
                <Link 
                  to="/upload" 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Upload a Meme
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {memes.map(meme => (
                <MemeCard 
                  key={meme._id} 
                  meme={meme} 
                  onLike={handleLike}
                  onCommentAdded={handleCommentAdded}
                />
              ))}
              
              {hasMore && (
                <div className="flex justify-center my-4">
                  <button
                    onClick={() => fetchMemes()}
                    disabled={loading}
                    className={`px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
