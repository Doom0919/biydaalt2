/**
 * Client-side image classification using TensorFlow.js
 * Runs entirely in the browser - no backend needed!
 */

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

// CIFAR-10 classes
const CIFAR10_CLASSES = [
  'airplane', 'automobile', 'bird', 'cat', 'deer',
  'dog', 'frog', 'horse', 'ship', 'truck'
];

let model = null;

/**
 * Load MobileNet model (runs in browser)
 */
export async function loadModel() {
  if (!model) {
    console.log('Loading MobileNet model...');
    // Ensure TensorFlow.js is ready
    await tf.ready();
    model = await mobilenet.load();
    console.log('Model loaded!');
  }
  return model;
}

/**
 * Classify images using browser-based TensorFlow.js
 * 
 * @param {File[]} imageFiles - Array of image files to classify
 * @returns {Promise<Object>} Object with results and class_counts
 */
export async function classifyImages(imageFiles) {
  try {
    // Load model if not already loaded
    await loadModel();
    
    const results = [];
    const class_counts = {};
    
    // Process each image
    for (const file of imageFiles) {
      const result = await classifyImage(file);
      results.push(result);
      
      if (result.class !== 'error') {
        class_counts[result.class] = (class_counts[result.class] || 0) + 1;
      }
    }
    
    return {
      results,
      class_counts,
      total_images: results.length
    };
    
  } catch (error) {
    console.error('Error classifying images:', error);
    throw error;
  }
}

/**
 * Classify a single image
 */
async function classifyImage(file) {
  try {
    // Create image element
    const img = await createImageElement(file);
    
    // Classify using MobileNet
    const predictions = await model.classify(img);
    
    // Map to CIFAR-10 classes (best effort)
    const mappedClass = mapToCIFAR10(predictions[0].className);
    
    return {
      filename: file.name,
      class: mappedClass,
      confidence: Math.round(predictions[0].probability * 100),
      originalPrediction: predictions[0].className
    };
    
  } catch (error) {
    return {
      filename: file.name,
      class: 'error',
      error: error.message
    };
  }
}

/**
 * Create an image element from a file
 */
function createImageElement(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Map MobileNet predictions to CIFAR-10 classes
 * This is a best-effort mapping since MobileNet has 1000 classes
 */
function mapToCIFAR10(prediction) {
  const lower = prediction.toLowerCase();
  
  // Aircraft
  if (lower.includes('aircraft') || lower.includes('airliner') || lower.includes('wing')) {
    return 'airplane';
  }
  
  // Vehicles
  if (lower.includes('car') || lower.includes('racer') || lower.includes('sedan') || 
      lower.includes('taxi') || lower.includes('coupe')) {
    return 'automobile';
  }
  
  if (lower.includes('truck') || lower.includes('pickup') || lower.includes('van')) {
    return 'truck';
  }
  
  // Animals
  if (lower.includes('bird') || lower.includes('eagle') || lower.includes('sparrow') ||
      lower.includes('chicken') || lower.includes('parrot')) {
    return 'bird';
  }
  
  if (lower.includes('cat') || lower.includes('kitty') || lower.includes('tabby') ||
      lower.includes('persian')) {
    return 'cat';
  }
  
  if (lower.includes('dog') || lower.includes('puppy') || lower.includes('hound') ||
      lower.includes('retriever') || lower.includes('terrier') || lower.includes('poodle')) {
    return 'dog';
  }
  
  if (lower.includes('deer') || lower.includes('elk') || lower.includes('moose')) {
    return 'deer';
  }
  
  if (lower.includes('frog') || lower.includes('toad') || lower.includes('amphibian')) {
    return 'frog';
  }
  
  if (lower.includes('horse') || lower.includes('pony') || lower.includes('stallion')) {
    return 'horse';
  }
  
  // Ships
  if (lower.includes('ship') || lower.includes('boat') || lower.includes('vessel') ||
      lower.includes('submarine') || lower.includes('liner') || lower.includes('yacht')) {
    return 'ship';
  }
  
  // Default: try to find closest match or return original
  for (const cifar_class of CIFAR10_CLASSES) {
    if (lower.includes(cifar_class)) {
      return cifar_class;
    }
  }
  
  // If no match, return the first CIFAR class that seems related
  return 'automobile'; // Default fallback
}

/**
 * Check if model is loaded (always returns true for browser-based)
 */
export async function checkHealth() {
  try {
    await loadModel();
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Download not available in browser mode
 */
export async function downloadClassifiedImages(sessionId) {
  console.log('Download not available in browser-only mode');
}
