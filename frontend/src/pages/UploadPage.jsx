import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';

const UploadPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreview(reader.result);
    };
  };

// In your UploadPage.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedFile) {
    toast.error('Please select an image to upload');
    return;
  }
  
  try {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('caption', caption);
    
    console.log('Token being used:', token);
    
    const response = await axios.post('http://localhost:5000/api/memes/', formData, {
      headers: {
        'Authorization': `Bearer ${token}` // Make sure token is not null or undefined
      }
    });
    
    toast.success('Meme uploaded successfully!');
    navigate('/');
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.response) {
      console.error('Error response:', error.response.data);
      toast.error(error.response.data.error || 'Failed to upload meme');
    } else if (error.request) {
      toast.error('No response from server. Please try again.');
    } else {
      toast.error('Error preparing upload. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Upload a Meme</h1>
        
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Meme Image
            </label>
            
            {preview ? (
              <div className="mb-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-80 rounded-lg mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                  }}
                  className="mt-2 text-sm text-red-500 hover:text-red-700"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG or GIF (Max 10MB)</p>
                  </div>
                  <input 
                    id="file-upload"
                    name="image"
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
                </label>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="caption">
              Caption (optional)
            </label>
            <textarea
              id="caption"
              name="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a funny caption to your meme..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            ></textarea>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition ${
                (!selectedFile || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Uploading...' : 'Upload Meme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;