import React, { useState } from 'react';
import { classifyImages, downloadClassifiedImages } from './api';

function App() {
  // State for selected files and their preview URLs
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  // State for classification results
  const [results, setResults] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [classCounts, setClassCounts] = useState({});
  
  // State for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    // Store files
    setSelectedFiles(files);
    
    // Create preview URLs for each image
    const newPreviews = files.map(file => ({
      file: file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setPreviews(newPreviews);
    
    // Clear previous results and errors
    setResults({});
    setSessionId(null);
    setClassCounts({});
    setError(null);
  };

  /**
   * Handle image classification
   */
  const handleClassify = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call API to classify images
      const data = await classifyImages(selectedFiles);
      
      // Convert results array to object keyed by filename for easy lookup
      const resultsMap = {};
      data.results.forEach(result => {
        resultsMap[result.filename] = result.class;
      });
      
      setResults(resultsMap);
      setSessionId(data.session_id);
      setClassCounts(data.class_counts || {});
      
    } catch (err) {
      setError(`Failed to classify images: ${err.message}. Make sure the backend server is running on port 5000.`);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle download of classified images
   */
  const handleDownload = async () => {
    if (!sessionId) return;
    
    setDownloadLoading(true);
    setError(null);
    
    try {
      await downloadClassifiedImages(sessionId);
    } catch (err) {
      setError(`Failed to download images: ${err.message}`);
    } finally {
      setDownloadLoading(false);
    }
  };

  /**
   * Clear all selections and results
   */
  const handleClear = () => {
    // Revoke object URLs to free memory
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    
    setSelectedFiles([]);
    setPreviews([]);
    setResults({});
    setSessionId(null);
    setClassCounts({});
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🖼️ CIFAR-10 Image Classifier</h1>
        <p>Upload images to classify them using a pretrained PyTorch ResNet20 model</p>
      </header>

      <main className="main-content">
        {/* File Input Section */}
        <div className="upload-section">
          <label htmlFor="file-input" className="file-input-label">
            Choose Images
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          
          {selectedFiles.length > 0 && (
            <p className="file-count">
              {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {selectedFiles.length > 0 && (
          <div className="button-group">
            <button 
              onClick={handleClassify} 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Classifying...' : 'Classify Images'}
            </button>
            
            {sessionId && (
              <button 
                onClick={handleDownload}
                disabled={downloadLoading}
                className="btn btn-download"
              >
                {downloadLoading ? 'Downloading...' : '📥 Download ZIP'}
              </button>
            )}
            
            <button 
              onClick={handleClear}
              disabled={loading}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
        )}

        {/* Class Distribution Summary */}
        {sessionId && Object.keys(classCounts).length > 0 && (
          <div className="summary-section">
            <h3>Classification Summary:</h3>
            <div className="class-distribution">
              {Object.entries(classCounts).map(([className, count]) => (
                <div key={className} className="class-stat">
                  <span className="class-name">{className}</span>
                  <span className="class-count">{count} image{count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
            <p className="save-info">✅ Images saved to folders by class on server</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Image Previews Grid */}
        {previews.length > 0 && (
          <div className="previews-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-card">
                <div className="image-container">
                  <img 
                    src={preview.url} 
                    alt={preview.name}
                    className="preview-image"
                  />
                </div>
                
                <div className="preview-info">
                  <p className="filename">{preview.name}</p>
                  
                  {results[preview.name] && (
                    <div className="result">
                      <span className="result-label">Class:</span>
                      <span className="result-value">{results[preview.name]}</span>
                    </div>
                  )}
                  
                  {loading && (
                    <p className="loading-text">Processing...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        {previews.length === 0 && (
          <div className="info-section">
            <h3>How to use:</h3>
            <ol>
              <li>Click "Choose Images" to select one or more images</li>
              <li>Click "Classify Images" to get predictions</li>
              <li>View the predicted class for each image</li>
            </ol>
            
            <div className="classes-info">
              <h4>Available Classes:</h4>
              <div className="classes-list">
                <span className="class-badge">airplane</span>
                <span className="class-badge">automobile</span>
                <span className="class-badge">bird</span>
                <span className="class-badge">cat</span>
                <span className="class-badge">deer</span>
                <span className="class-badge">dog</span>
                <span className="class-badge">frog</span>
                <span className="class-badge">horse</span>
                <span className="class-badge">ship</span>
                <span className="class-badge">truck</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Powered by PyTorch & Flask Backend | React Frontend</p>
      </footer>
    </div>
  );
}

export default App;
