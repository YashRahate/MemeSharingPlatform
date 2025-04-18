import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getCurrentUser: () => api.get('/api/auth/me'),
  updateProfile: (userData) => api.put('/api/auth/me', userData),
};

// User API
export const userAPI = {
  getUser: (userId) => api.get(`/api/users/${userId}`),
  searchUsers: (query, limit = 10, skip = 0) => 
    api.get(`/api/users/search?q=${query}&limit=${limit}&skip=${skip}`),
  followUser: (userId) => api.post(`/api/users/${userId}/follow`),
  unfollowUser: (userId) => api.post(`/api/users/${userId}/unfollow`),
  getFollowers: (userId, limit = 10, skip = 0) => 
    api.get(`/api/users/${userId}/followers?limit=${limit}&skip=${skip}`),
  getFollowing: (userId, limit = 10, skip = 0) => 
    api.get(`/api/users/${userId}/following?limit=${limit}&skip=${skip}`),
  getUserMemes: (userId, limit = 10, skip = 0) => 
    api.get(`/api/users/${userId}/memes?limit=${limit}&skip=${skip}`),
};

// Meme API
export const memeAPI = {
  getFeed: (limit = 10, skip = 0) => 
    api.get(`/api/memes/feed?limit=${limit}&skip=${skip}`),
  getMeme: (memeId) => api.get(`/api/memes/${memeId}`),
  createMeme: (formData) => {
    return api.post('/api/memes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateMeme: (memeId, data) => api.put(`/api/memes/${memeId}`, data),
  deleteMeme: (memeId) => api.delete(`/api/memes/${memeId}`),
  likeMeme: (memeId) => api.post(`/api/memes/${memeId}/like`),
  unlikeMeme: (memeId) => api.post(`/api/memes/${memeId}/unlike`),
  getComments: (memeId, limit = 10, skip = 0) => 
    api.get(`/api/memes/${memeId}/comments?limit=${limit}&skip=${skip}`),
  addComment: (memeId, text) => api.post(`/api/memes/${memeId}/comments`, { text }),
  deleteComment: (commentId) => api.delete(`/api/memes/comments/${commentId}`),
};

export default api;