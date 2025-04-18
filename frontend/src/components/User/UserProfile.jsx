import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import FollowButton from './FollowButton';
import MemeGrid from '../Meme/MemeGrid';

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser, token } = useAuth();
  const [user, setUser] = useState(null);
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('memes');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setUser(userResponse.data);
        setFollowersCount(userResponse.data.followers_count);
        setFollowingCount(userResponse.data.following_count);
        
        // Fetch user memes
        const memesResponse = await axios.get(`http://localhost:5000/api/users/${userId}/memes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMemes(memesResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (token && userId) {
      fetchUserData();
    }
  }, [userId, token]);

  const fetchFollowers = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowers(response.data);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Failed to load followers');
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/following`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowing(response.data);
    } catch (error) {
      console.error('Error fetching following:', error);
      toast.error('Failed to load following');
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    
    if (newTab === 'followers' && followers.length === 0) {
      fetchFollowers();
    } else if (newTab === 'following' && following.length === 0) {
      fetchFollowing();
    }
  };

  const handleFollowChange = (isFollowing) => {
    setUser(prev => ({
      ...prev,
      is_following: isFollowing
    }));
    
    setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-bold">User not found</h2>
        <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
              {user.profile_pic ? (
                <img 
                  src={user.profile_pic} 
                  alt={user.username} 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-gray-500">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600 mt-1">{user.bio || 'No bio'}</p>
              <div className="flex mt-2 space-x-4">
                <button 
                  onClick={() => handleTabChange('followers')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <span className="font-bold">{followersCount}</span> followers
                </button>
                <button 
                  onClick={() => handleTabChange('following')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <span className="font-bold">{followingCount}</span> following
                </button>
                <div>
                  <span className="font-bold">{memes.length}</span> memes
                </div>
              </div>
            </div>
          </div>
          
          {!isOwnProfile && (
            <FollowButton 
              userId={userId} 
              isFollowing={user.is_following}
              onFollowChange={handleFollowChange}
            />
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            onClick={() => handleTabChange('memes')}
            className={`px-4 py-2 font-medium ${
              tab === 'memes'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
          >
            Memes
          </button>
          <button
            onClick={() => handleTabChange('followers')}
            className={`px-4 py-2 font-medium ${
              tab === 'followers'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => handleTabChange('following')}
            className={`px-4 py-2 font-medium ${
              tab === 'following'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-600'
            }`}
          >
            Following
          </button>
        </div>
      </div>
      
      {tab === 'memes' && (
        <div className="pb-8">
          {memes.length > 0 ? (
            <MemeGrid memes={memes} />
          ) : (
            <div className="text-center py-10 text-gray-500">
              No memes yet
            </div>
          )}
        </div>
      )}
      
      {tab === 'followers' && (
        <div className="space-y-2 pb-8">
          {followers.length > 0 ? (
            followers.map(follower => (
              <div key={follower._id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
                <Link to={`/profile/${follower._id}`} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {follower.profile_pic ? (
                      <img 
                        src={follower.profile_pic} 
                        alt={follower.username} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-500">
                        {follower.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{follower.username}</p>
                  </div>
                </Link>
                {currentUser._id !== follower._id && (
                  <FollowButton 
                    userId={follower._id} 
                    isFollowing={follower.is_following}
                  />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No followers yet
            </div>
          )}
        </div>
      )}
      
      {tab === 'following' && (
        <div className="space-y-2 pb-8">
          {following.length > 0 ? (
            following.map(user => (
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
                  </div>
                </Link>
                <FollowButton 
                  userId={user._id} 
                  isFollowing={true}
                />
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              Not following anyone yet
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;