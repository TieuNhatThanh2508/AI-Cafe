from ultralytics import YOLO

model = YOLO("yolov8n.pt")  # pretrained nano model
results = model("Input\IMG_0017.JPG")  # runs detection
results.show()

