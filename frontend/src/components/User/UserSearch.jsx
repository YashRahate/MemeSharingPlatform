import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import FollowButton from './FollowButton';

const UserSearch = () => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch users based on debounced query
  useEffect(() => {
    const searchUsers = async () => {
      if (debouncedQuery.trim() === '') {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/users/search?q=${debouncedQuery}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery, token]);

  const handleFollowChange = (userId, isFollowing) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user._id === userId ? { ...user, is_following: isFollowing } : user
      )
    );
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {users.length > 0 ? (
            users.map(user => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                <Link to={`/profile/${user._id}`} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {user.profile_pic ? (
                      <img 
                        src={user.profile_pic} 
                        alt={user.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-500">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.bio || 'No bio'}</p>
                  </div>
                </Link>
                <FollowButton 
                  userId={user._id} 
                  isFollowing={user.is_following}
                  onFollowChange={(isFollowing) => handleFollowChange(user._id, isFollowing)}
                />
              </div>
            ))
          ) : (
            query.trim() !== '' && !loading && (
              <p className="text-center text-gray-500 py-4">No users found</p>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;