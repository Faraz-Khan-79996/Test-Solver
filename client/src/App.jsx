import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handlePaste = (event) => {
      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          setSelectedFile(file);

          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;

          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("No file selected. Please upload an image.");
      return;
    }

    setLoading(true);
    setError("");
    setExtractedText("");
    setAiResponse("");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await axios.post("/api/extract-text", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setExtractedText(response.data.text);
      setAiResponse(response.data.answer);
    } catch (err) {
      setError("Failed to process the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-lg p-10 w-full max-w-2xl">
        <h1 className="text-4xl font-extrabold text-indigo-700 text-center mb-8">
          AI Problem solver
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="font-sans text-xl text-center py-6 ">
              Upload the image of the problem, wait for a few seconds then get your solution.
            </div>
            <label
              htmlFor="fileInput"
              className="block text-lg font-medium text-gray-700 mb-2"
            >
              Upload Image (or Paste):
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-lg border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 text-xl font-bold rounded-lg transition-all ${
              loading
                ? "bg-indigo-300 text-white cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Upload and Analyze"}
          </button>
        </form>
        {error && (
          <p className="text-center text-red-600 font-medium mt-4">{error}</p>
        )}
        {extractedText && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Extracted Text:
            </h2>
            <p className="bg-gray-100 text-lg p-4 rounded-lg shadow-sm text-gray-700">
              {extractedText}
            </p>
          </div>
        )}
        {aiResponse && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              AI Response:
            </h2>
            <div className="bg-gray-100 text-lg p-4 rounded-lg shadow-sm text-gray-700">
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
