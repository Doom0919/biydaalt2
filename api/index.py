"""
Serverless API for CIFAR-10 Image Classification on Vercel
Uses pretrained PyTorch ResNet20 model to classify images
"""

from flask import Flask, request, jsonify
from werkzeug.wrappers import Response
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import base64

app = Flask(__name__)

# CIFAR-10 class labels
CIFAR10_CLASSES = [
    'airplane', 'automobile', 'bird', 'cat', 'deer',
    'dog', 'frog', 'horse', 'ship', 'truck'
]

# Global model variable (loaded once per serverless instance)
_model = None

def get_model():
    """Load model lazily (only once per serverless instance)"""
    global _model
    if _model is None:
        print("Loading pretrained CIFAR-10 ResNet20 model...")
        _model = torch.hub.load(
            "chenyaofo/pytorch-cifar-models",
            "cifar10_resnet20",
            pretrained=True
        )
        _model.eval()
        print("Model loaded successfully!")
    return _model

# Image preprocessing pipeline
transform = transforms.Compose([
    transforms.Resize((32, 32)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.4914, 0.4822, 0.4465],
        std=[0.2023, 0.1994, 0.2010]
    )
])

def predict_image(image_bytes, filename):
    """
    Predict the class of a single image
    
    Args:
        image_bytes: Raw image bytes
        filename: Original filename
        
    Returns:
        Dictionary with filename and predicted class
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Preprocess image
        input_tensor = transform(image)
        input_batch = input_tensor.unsqueeze(0)
        
        # Get model and perform inference
        model = get_model()
        with torch.no_grad():
            output = model(input_batch)
            
        # Get predicted class
        probabilities = torch.nn.functional.softmax(output[0], dim=0)
        _, predicted_idx = torch.max(output, 1)
        predicted_class = CIFAR10_CLASSES[predicted_idx.item()]
        confidence = probabilities[predicted_idx.item()].item()
        
        return {
            "filename": filename,
            "class": predicted_class,
            "confidence": round(confidence * 100, 2)
        }
        
    except Exception as e:
        return {
            "filename": filename,
            "class": "error",
            "error": str(e)
        }

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    POST endpoint to classify multiple images
    Expects form field 'images' containing one or more image files
    
    Returns:
        JSON object with classification results
    """
    # Check if images were provided
    if 'images' not in request.files:
        return jsonify({"error": "No images provided"}), 400
    
    files = request.files.getlist('images')
    
    if len(files) == 0:
        return jsonify({"error": "No images provided"}), 400
    
    results = []
    class_counts = {}
    
    # Process each uploaded image
    for file in files:
        if file.filename == '':
            continue
            
        # Read image bytes
        image_bytes = file.read()
        
        # Predict class
        result = predict_image(image_bytes, file.filename)
        results.append(result)
        
        # Count images per class
        if result.get('class') != 'error':
            class_counts[result['class']] = class_counts.get(result['class'], 0) + 1
    
    return jsonify({
        "results": results,
        "class_counts": class_counts,
        "total_images": len(results)
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model": "cifar10_resnet20",
        "classes": CIFAR10_CLASSES
    })

@app.route('/api/', methods=['GET'])
def index():
    """API index endpoint"""
    return jsonify({
        "message": "CIFAR-10 Image Classification API",
        "endpoints": {
            "/api/predict": "POST - Classify images",
            "/api/health": "GET - Health check"
        }
    })

# Vercel serverless function handler
def handler(request):
    with app.request_context(request.environ):
        try:
            # Process the request through Flask
            response = app.full_dispatch_request()
        except Exception as e:
            response = jsonify({"error": str(e)})
            response.status_code = 500
    return response
