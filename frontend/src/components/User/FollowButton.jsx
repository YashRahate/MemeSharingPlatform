import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';

const FollowButton = ({ userId, isFollowing, onFollowChange }) => {
  const { token } = useAuth();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async () => {
    if (loading) return;

    try {
      setLoading(true);
      
      const endpoint = following 
        ? `http://localhost:5000/api/users/${userId}/unfollow`
        : `http://localhost:5000/api/users/${userId}/follow`;
      
      const response = await axios.post(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setFollowing(!following);
      
      if (onFollowChange) {
        onFollowChange(!following);
      }
      
      toast.success(following ? 'Unfollowed successfully' : 'Followed successfully');
    } catch (error) {
      console.error('Follow error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-1 rounded font-medium text-sm transition ${
        following
          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          : 'bg-blue-500 text-white hover:bg-blue-600'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? 'Processing...' : following ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;