# CIFAR-10 Image Classifier

A full-stack web application that classifies images using a pretrained PyTorch CIFAR-10 ResNet20 model.

## 🏗️ Project Structure

```
project/
 ├── backend/
 │     └── app.py          # Flask server with PyTorch model
 └── frontend/
       ├── public/
       │     └── index.html
       ├── src/
       │     ├── App.js     # Main React component
       │     ├── api.js     # API service for backend communication
       │     ├── App.css    # Styling
       │     └── index.js   # React entry point
       └── package.json
```

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install flask flask-cors torch torchvision pillow
   ```

3. **Run the Flask server:**
   ```bash
   python app.py
   ```

   The backend will start on `http://localhost:5000`

   **Note:** The first time you run the server, PyTorch will download the pretrained model (~3MB). This may take a minute.

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm start
   ```

   The frontend will open automatically at `http://localhost:3000`

## 📝 Usage

1. **Start both servers** (backend on port 5000, frontend on port 3000)

2. **Open your browser** to `http://localhost:3000`

3. **Click "Choose Images"** to select one or more images

4. **Click "Classify Images"** to get predictions

5. **View results** displayed under each image thumbnail

## 🏷️ CIFAR-10 Classes

The model can classify images into these 10 categories:
- airplane
- automobile
- bird
- cat
- deer
- dog
- frog
- horse
- ship
- truck

## 🔧 Technical Details

### Backend (Flask + PyTorch)
- **Framework:** Flask with CORS enabled
- **Model:** `cifar10_resnet20` from `chenyaofo/pytorch-cifar-models`
- **Preprocessing:** Resize to 32×32, normalize with CIFAR-10 statistics
- **Endpoint:** `POST /predict` accepts multiple images via FormData
- **Port:** 5000

### Frontend (React)
- **Framework:** React 18
- **HTTP Client:** Native `fetch` API
- **Styling:** Custom CSS with gradient background
- **Features:**
  - Multiple image upload
  - Image preview grid (120×120 thumbnails)
  - Real-time classification results
  - Error handling and loading states

## 📋 Requirements

### Backend
- Python 3.7+
- flask
- flask-cors
- torch
- torchvision
- pillow

### Frontend
- Node.js 14+
- npm or yarn
- react
- react-dom
- react-scripts

## 🛠️ API Documentation

### POST /predict

**Request:**
- Content-Type: `multipart/form-data`
- Field name: `images` (multiple files)

**Response:**
```json
[
  {"filename": "image1.png", "class": "dog"},
  {"filename": "image2.jpg", "class": "airplane"}
]
```

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "model": "cifar10_resnet20"
}
```

## 🎨 Features

✅ Multiple image upload and classification  
✅ Real-time image preview grid  
✅ Clean, modern UI with gradient design  
✅ Responsive layout for mobile and desktop  
✅ Error handling and loading states  
✅ CORS enabled for cross-origin requests  

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- PyTorch CIFAR models by [chenyaofo](https://github.com/chenyaofo/pytorch-cifar-models)
- CIFAR-10 dataset by Alex Krizhevsky
