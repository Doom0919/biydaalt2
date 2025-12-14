"""
Flask Backend for CIFAR-10 Image Classification
Uses pretrained PyTorch ResNet20 model to classify images
Saves classified images into separate folders by class
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import os
import shutil
from datetime import datetime
import zipfile

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Directory to save classified images
OUTPUT_DIR = "classified_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# CIFAR-10 class labels
CIFAR10_CLASSES = [
    'airplane', 'automobile', 'bird', 'cat', 'deer',
    'dog', 'frog', 'horse', 'ship', 'truck'
]

# Load pretrained CIFAR-10 model
print("Loading pretrained CIFAR-10 ResNet20 model...")
model = torch.hub.load(
    "chenyaofo/pytorch-cifar-models",
    "cifar10_resnet20",
    pretrained=True
)
model.eval()  # Set to evaluation mode
print("Model loaded successfully!")

# Image preprocessing pipeline
# CIFAR-10 expects 32x32 images normalized with specific mean and std
transform = transforms.Compose([
    transforms.Resize((32, 32)),  # Resize to 32x32
    transforms.ToTensor(),         # Convert to tensor [0, 1]
    transforms.Normalize(          # Normalize with CIFAR-10 statistics
        mean=[0.4914, 0.4822, 0.4465],
        std=[0.2023, 0.1994, 0.2010]
    )
])


def predict_image(image_bytes, filename, session_id):
    """
    Predict the class of a single image and save it to appropriate folder
    
    Args:
        image_bytes: Raw image bytes
        filename: Original filename
        session_id: Unique session ID for this classification batch
        
    Returns:
        Dictionary with filename and predicted class
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed (handle RGBA, grayscale, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess image for classification
        input_tensor = transform(image)
        input_batch = input_tensor.unsqueeze(0)  # Add batch dimension
        
        # Perform inference
        with torch.no_grad():
            output = model(input_batch)
            
        # Get predicted class
        _, predicted_idx = torch.max(output, 1)
        predicted_class = CIFAR10_CLASSES[predicted_idx.item()]
        
        # Save image to class folder
        session_dir = os.path.join(OUTPUT_DIR, session_id)
        class_dir = os.path.join(session_dir, predicted_class)
        os.makedirs(class_dir, exist_ok=True)
        
        # Save the original image to the class folder
        save_path = os.path.join(class_dir, filename)
        image.save(save_path)
        
        return {
            "filename": filename,
            "class": predicted_class,
            "saved_path": save_path
        }
        
    except Exception as e:
        return {
            "filename": filename,
            "class": "error",
            "error": str(e)
        }


@app.route('/predict', methods=['POST'])
def predict():
    """
    POST endpoint to classify multiple images
    Expects form field 'images' containing one or more image files
    Saves images into folders by class and returns session_id for download
    
    Returns:
        JSON object with classification results and session_id
    """
    # Check if images were provided
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400
    
    files = request.files.getlist('images')
    
    if len(files) == 0:
        return jsonify({"error": "No images provided"}), 400
    
    # Create unique session ID based on timestamp
    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    results = []
    class_counts = {}
    
    # Process each uploaded image
    for file in files:
        if file.filename == '':
            continue
            
        # Read image bytes
        image_bytes = file.read()
        
        # Predict class and save to folder
        result = predict_image(image_bytes, file.filename, session_id)
        results.append(result)
        
        # Count images per class
        if result.get('class') != 'error':
            class_counts[result['class']] = class_counts.get(result['class'], 0) + 1
    
    return jsonify({
        "results": results,
        "session_id": session_id,
        "class_counts": class_counts,
        "total_images": len(results)
    })


@app.route('/download/<session_id>', methods=['GET'])
def download(session_id):
    """
    Download all classified images as a ZIP file
    
    Args:
        session_id: Session ID from classification
        
    Returns:
        ZIP file containing all classified images organized by folders
    """
    session_dir = os.path.join(OUTPUT_DIR, session_id)
    
    if not os.path.exists(session_dir):
        return jsonify({"error": "Session not found"}), 404
    
    # Create ZIP file
    zip_filename = f"classified_images_{session_id}.zip"
    zip_path = os.path.join(OUTPUT_DIR, zip_filename)
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Walk through session directory and add all files
        for root, dirs, files in os.walk(session_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Get relative path for ZIP structure
                arcname = os.path.relpath(file_path, session_dir)
                zipf.write(file_path, arcname)
    
    return send_file(zip_path, as_attachment=True, download_name=zip_filename)


@app.route('/sessions', methods=['GET'])
def list_sessions():
    """
    List all available classification sessions
    
    Returns:
        JSON array of session IDs
    """
    sessions = []
    if os.path.exists(OUTPUT_DIR):
        sessions = [d for d in os.listdir(OUTPUT_DIR) 
                   if os.path.isdir(os.path.join(OUTPUT_DIR, d))]
    
    return jsonify({"sessions": sessions})


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": "cifar10_resnet20"})


if __name__ == '__main__':
    print("\n" + "="*50)
    print("CIFAR-10 Image Classification Server")
    print("="*50)
    print(f"Available classes: {', '.join(CIFAR10_CLASSES)}")
    print(f"Images will be saved to: {os.path.abspath(OUTPUT_DIR)}")
    print("Server running on http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "model": "cifar10_resnet20"})


if __name__ == '__main__':
    print("\n" + "="*50)
    print("CIFAR-10 Image Classification Server")
    print("="*50)
    print(f"Available classes: {', '.join(CIFAR10_CLASSES)}")
    print("Server running on http://localhost:5000")
    print("="*50 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
