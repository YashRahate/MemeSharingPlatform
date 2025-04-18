import React, { useState, useEffect } from 'react';
import { memeAPI } from '../../api/api';
import MemeCard from './MemeCard';

const MemeGrid = ({ userId = null, searchQuery = null }) => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMemes = async (reset = false) => {
    try {
      setLoading(true);
      let response;
      
      // Skip value for pagination
      const skip = reset ? 0 : memes.length;
      
      if (userId) {
        // Fetch user's memes if userId is provided
        response = await memeAPI.getUserMemes(userId, 10, skip);
      } else {
        // Fetch feed memes by default
        response = await memeAPI.getFeed(10, skip);
      }
      
      const newMemes = response.data;
      
      // Update the state depending on if we're resetting or adding more
      setMemes(prev => (reset ? newMemes : [...prev, ...newMemes]));
      
      // Check if we have more memes to load
      setHasMore(newMemes.length === 10);
    } catch (err) {
      setError('Failed to load memes. Please try again later.');
      console.error('Error fetching memes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMemes(true);
  }, [userId, searchQuery]);

  // Handle meme update
  const handleMemeUpdate = (updatedMeme) => {
    setMemes(prev => 
      prev.map(meme => meme._id === updatedMeme._id ? updatedMeme : meme)
    );
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {memes.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No memes found</p>
          {userId && <p className="text-gray-500">This user hasn't posted any memes yet.</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {memes.map(meme => (
            <MemeCard 
              key={meme._id} 
              meme={meme} 
              onUpdate={handleMemeUpdate} 
            />
          ))}
        </div>
      )}
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {hasMore && !loading && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={() => fetchMemes()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default MemeGrid;