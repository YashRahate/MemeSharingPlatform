import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const MemeEdit = ({ memeId, onClose, onMemeUpdated }) => {
  const { token } = useAuth();
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [meme, setMeme] = useState(null);

  useEffect(() => {
    const fetchMeme = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/memes/${memeId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setMeme(response.data);
        setCaption(response.data.caption || '');
      } catch (error) {
        console.error('Error fetching meme:', error);
        toast.error('Failed to load meme details');
        onClose();
      } finally {
        setLoading(false);
      }
    };

    if (memeId && token) {
      fetchMeme();
    }
  }, [memeId, token, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const response = await axios.put(
        `http://localhost:5000/api/memes/${memeId}`,
        { caption },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (onMemeUpdated) {
        onMemeUpdated(response.data);
      }
      
      toast.success('Meme updated successfully');
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update meme');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Meme not found or you don't have permission to edit it.</p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Edit Meme</h2>
      
      <div className="mb-4">
        <img 
          src={meme.image_url} 
          alt="Meme"
          className="w-full max-h-64 object-contain"
        />
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caption">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
          ></textarea>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemeEdit;