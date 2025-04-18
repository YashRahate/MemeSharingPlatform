import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { memeAPI } from '../../api/api';
import useAuth from '../../hooks/useAuth';

const MemeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setSelectedFile(null);
      setPreview(null);
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Clear previous error
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image to upload');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption);
      
      const response = await memeAPI.createMeme(formData);
      
      // Redirect to home page or meme detail page
      navigate(`/profile/${currentUser._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload meme. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload a Meme</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Image
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {!preview ? (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </>
              ) : (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="object-contain max-h-64 mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-2">
            Caption (Optional)
          </label>
          <textarea
            id="caption"
            name="caption"
            rows="3"
            className="form-input"
            placeholder="Add a caption to your meme..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          ></textarea>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn btn-secondary mr-4"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? 'Uploading...' : 'Upload Meme'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MemeUpload;