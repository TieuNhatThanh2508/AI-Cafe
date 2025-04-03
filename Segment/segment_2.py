import cv2
import numpy as np
import os

def get_next_index(output_folder):
    """Lấy số thứ tự tiếp theo để lưu file tránh ghi đè."""
    existing_files = [f for f in os.listdir(output_folder) if f.endswith(".png")]
    indices = [int(f.split(".")[0]) for f in existing_files if f.split(".")[0].isdigit()]
    return max(indices, default=0) + 1

# Thư mục chứa ảnh đầu vào và đầu ra
input_folder = "Segment/input"
output_folder = "Segment/output"
output_folder_2 = "Segment/output_2"

# Tạo thư mục đầu ra nếu chưa tồn tại
os.makedirs(output_folder, exist_ok=True)
os.makedirs(output_folder_2, exist_ok=True)

# Kiểm tra danh sách file ảnh
image_files = [f for f in os.listdir(input_folder) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

if not image_files:
    print("Không tìm thấy ảnh nào trong thư mục input.")
else:
    next_index = get_next_index(output_folder_2)
    
    for filename in image_files:
        input_path = os.path.join(input_folder, filename)
        output_path = os.path.join(output_folder, filename)
        
        # Đọc ảnh
        image = cv2.imread(input_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # # Làm mờ ảnh để giảm nhiễu
        # blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        
        # # Áp dụng ngưỡng thích nghi để phát hiện hạt cà phê
        # thresh = cv2.adaptiveThreshold(
        #     blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        # )
        # Áp dụng ngưỡng thích nghi để phát hiện hạt cà phê không làm mờ
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )
        
        # Tìm các đường viền của hạt cà phê
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Xác định kích thước tối thiểu để lọc những hạt quá nhỏ
        min_size = 60
        max_size = 300

        image_with_boxes = image.copy()
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if max_size ** 2 > w * h > min_size ** 2:
                # Vẽ bounding box trên ảnh gốc
                cv2.rectangle(image_with_boxes, (x, y), (x + w, y + h), (0, 255, 0), 2)
                
                # Cắt ảnh hạt cà phê
                bean = image[y:y + h + 10, x:x + 10 + w].copy()
                
                # Resize về 224x224
                bean_resized = cv2.resize(bean, (224, 224))
                
                # Lưu hạt cà phê riêng lẻ
                bean_output_path = os.path.join(output_folder_2, f"{next_index}.png")
                cv2.imwrite(bean_output_path, bean_resized)
                next_index += 1
        
        # Lưu ảnh với bounding box vào output
        cv2.imwrite(output_path, image_with_boxes)
    
    print(f"Ảnh đã được xử lý và lưu tại thư mục: {output_folder}")
    print(f"Các hạt cà phê đã được lưu riêng tại thư mục: {output_folder_2}")