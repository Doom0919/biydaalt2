import torch
import torchvision.transforms as transforms
from PIL import Image

# --- CIFAR-10 pretrained ResNet20 татах ---
# TorchHub дотор байрладаг тул HTTPS error гарахгүй
model = torch.hub.load(
    'chenyaofo/pytorch-cifar-models',     # Model repo
    'cifar10_resnet20',                   # Model name
    pretrained=True                       # Pretrained weights
)
model.eval()

# --- CIFAR-10 preprocess ---
transform = transforms.Compose([
    transforms.Resize((32, 32)),
    transforms.ToTensor(),
    transforms.Normalize((0.4914, 0.4822, 0.4465),
                         (0.2470, 0.2435, 0.2616)),
])

# --- Зураг унших ---
img = Image.open("./image/cat.jpg").convert("RGB")
x = transform(img).unsqueeze(0)

# --- Prediction ---
with torch.no_grad():
    y = model(x)
    pred = y.argmax().item()

labels = [
    "airplane","automobile","bird","cat","deer",
    "dog","frog","horse","ship","truck"
]

print("Predicted:", labels[pred])
