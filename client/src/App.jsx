import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setExtractedText('');
    setAiResponse('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/extract-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setExtractedText(response.data.text);
      setAiResponse(response.data.answer);
    } catch (err) {
      setError('Failed to process the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">AI Image Analyzer</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-gray-700">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 focus:outline-none"
            style={{ borderRadius: '0' }} // Removed rounded corners
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Upload and Analyze'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        {extractedText && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700">Extracted Text:</h2>
            <p className="bg-gray-100 p-3 text-gray-800 mt-2">{extractedText}</p>
          </div>
        )}
        {aiResponse && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700">AI Response:</h2>
            <div className="bg-gray-100 p-3 text-gray-800 mt-2">
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
