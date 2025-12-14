/**
 * API service for communicating with Flask backend
 * Base URL points to Flask server running on port 5000 in development
 * In production on Vercel, it uses the relative /api path
 */

// Use relative path for API calls (works in production)
// In development, use localhost:5000
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : '';

/**
 * Classify multiple images using the backend API
 * 
 * @param {File[]} imageFiles - Array of image files to classify
 * @returns {Promise<Object>} Object with results, session_id, and class_counts
 */
export async function classifyImages(imageFiles) {
  // Create FormData to send files
  const formData = new FormData();
  
  // Append all images to the 'images' field
  imageFiles.forEach(file => {
    formData.append('images', file);
  });
  
  try {
    // Send POST request to /api/predict endpoint
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    
    // Parse and return JSON response
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Error classifying images:', error);
    throw error;
  }
}

/**
 * Download classified images as ZIP file
 * 
 * @param {string} sessionId - Session ID from classification
 */
export async function downloadClassifiedImages(sessionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/download/${sessionId}`);
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    
    // Get the blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classified_images_${sessionId}.zip`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
  } catch (error) {
    console.error('Error downloading images:', error);
    throw error;
  }
}

/**
 * Check if backend server is healthy
 * 
 * @returns {Promise<boolean>} True if server is healthy
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
