import React from 'react';
import { Link } from 'react-router-dom';

const Comment = ({ comment, currentUser, onDelete }) => {
  const isOwner = currentUser && currentUser._id === comment.user_id;
  const formattedDate = new Date(comment.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return (
    <div className="flex items-start space-x-2">
      <Link to={`/profile/${comment.user_id}`} className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
          {comment.user?.username ? comment.user.username[0].toUpperCase() : '?'}
        </div>
      </Link>
      
      <div className="flex-grow">
        <div className="bg-gray-100 rounded-lg px-3 py-2">
          <Link to={`/profile/${comment.user_id}`} className="font-semibold text-sm">
            {comment.user?.username || 'Unknown User'}
          </Link>{' '}
          <span className="text-sm text-gray-800">{comment.text}</span>
        </div>
        
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{formattedDate}</span>
          
          {isOwner && (
            <button
              onClick={() => onDelete(comment._id)}
              className="ml-2 text-red-500 hover:text-red-700"
              aria-label="Delete comment"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comment;