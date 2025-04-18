import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { memeAPI } from '../../api/api';
import useAuth from '../../hooks/useAuth';
import Comment from './Comment';

const MemeCard = ({ meme, onUpdate }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(meme.liked_by_user);
  const [likesCount, setLikesCount] = useState(meme.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(meme.recent_comments || []);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
    try {
      if (liked) {
        await memeAPI.unlikeMeme(meme._id);
        setLiked(false);
        setLikesCount(prevCount => prevCount - 1);
      } else {
        await memeAPI.likeMeme(meme._id);
        setLiked(true);
        setLikesCount(prevCount => prevCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoadingComment(true);
    try {
      const response = await memeAPI.addComment(meme._id, newComment);
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoadingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await memeAPI.deleteComment(commentId);
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const loadMoreComments = async () => {
    try {
      const response = await memeAPI.getComments(meme._id, 10, comments.length);
      setComments([...comments, ...response.data]);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      try {
        const response = await memeAPI.getComments(meme._id);
        setComments(response.data);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
    setShowComments(!showComments);
  };

  return (
    <div className="card my-6">
      {/* Meme Header */}
      <div className="flex items-center p-4">
        <Link to={`/profile/${meme.user_id}`} className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
            {meme.user?.username ? meme.user.username[0].toUpperCase() : '?'}
          </div>
          <div className="ml-3">
            <p className="font-medium">{meme.user?.username || 'Unknown User'}</p>
          </div>
        </Link>
        
        {/* Options menu for owner */}
        {currentUser && currentUser._id === meme.user_id && (
          <div className="ml-auto relative">
            <Link to={`/profile/${meme.user_id}/edit/${meme._id}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Link>
          </div>
        )}
      </div>
      
      {/* Meme Image */}
      <div className="w-full">
        <img 
          src={meme.image_url} 
          alt={meme.caption} 
          className="w-full object-contain max-h-96"
        />
      </div>
      
      {/* Meme Actions */}
      <div className="p-4">
        <div className="flex items-center mb-3">
          <button 
            onClick={handleLike}
            className={`mr-4 flex items-center ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
          >
            <svg className="w-6 h-6" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="ml-1">{likesCount}</span>
          </button>
          
          <button 
            onClick={toggleComments}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="ml-1">{comments.length}</span>
          </button>
        </div>
        
        {/* Caption */}
        {meme.caption && (
          <div className="my-2">
            <p>
              <Link to={`/profile/${meme.user_id}`} className="font-semibold mr-2">
                {meme.user?.username || 'Unknown User'}
              </Link>
              {meme.caption}
            </p>
          </div>
        )}
        
        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-1">
          {new Date(meme.created_at).toLocaleDateString()}
        </p>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {/* Add Comment Form */}
          {currentUser && (
            <form onSubmit={handleComment} className="flex items-center my-3">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-grow border-gray-300 focus:ring-blue-500 focus:border-blue-500 block w-full rounded-md sm:text-sm border p-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={loadingComment}
              />
              <button
                type="submit"
                className="ml-2 p-2 text-blue-600 disabled:text-gray-400"
                disabled={!newComment.trim() || loadingComment}
              >
                Post
              </button>
            </form>
          )}
          
          {/* Comments List */}
          <div className="space-y-3 mt-2">
            {comments.map(comment => (
              <Comment
                key={comment._id}
                comment={comment}
                currentUser={currentUser}
                onDelete={handleDeleteComment}
              />
            ))}
            
            {comments.length >= 10 && (
              <button
                onClick={loadMoreComments}
                className="text-blue-500 text-sm hover:underline"
              >
                Load more comments
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeCard;