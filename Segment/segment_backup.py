import cv2
import numpy as np
import os

def get_next_index(output_folder):
    """Lấy số thứ tự tiếp theo để lưu file tránh ghi đè."""
    existing_files = [f for f in os.listdir(output_folder) if f.endswith(".png")]
    indices = [int(f.split(".")[0]) for f in existing_files if f.split(".")[0].isdigit()]
    return max(indices, default=0) + 1

# Thư mục chứa ảnh đầu vào và đầu ra
input_folder = "./input"
output_folder = "./output"
output_folder_2 = "./output_2"

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
        
        # Lọc nhiễu
        filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
        
        # Phát hiện biên hạt cà phê
        _, thresh = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # Mở rộng vùng để tránh mất viền
        kernel = np.ones((5, 5), np.uint8)
        thresh = cv2.dilate(thresh, kernel, iterations=2)  # Thêm dilation
        
        # Tìm các đường viền
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Xác định kích thước hợp lệ
        min_size = 60
        max_size = 300

        image_with_boxes = image.copy()
        
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if max_size ** 2 > w * h > min_size ** 2:
                # Tăng padding để tránh cắt thiếu
                padding = 15
                x1, y1 = max(x - padding, 0), max(y - padding, 0)
                x2, y2 = min(x + w + padding, image.shape[1]), min(y + h + padding, image.shape[0])

                # Vẽ bounding box trên ảnh
                cv2.rectangle(image_with_boxes, (x1, y1), (x2, y2), (0, 255, 0), 2)
                
                # Cắt hạt cà phê
                bean = image[y1:y2, x1:x2].copy()
                
                # Resize về 224x224
                # bean_resized = cv2.resize(bean, (224, 224))
                bean_resized = bean
                # Lưu ảnh hạt cà phê
                bean_output_path = os.path.join(output_folder_2, f"{next_index}.png")
                cv2.imwrite(bean_output_path, bean_resized)
                next_index += 1
        
        # Lưu ảnh có bounding box
        cv2.imwrite(output_path, image_with_boxes)
    
    print(f"Ảnh đã được xử lý và lưu tại: {output_folder}")
    print(f"Hạt cà phê đã lưu tại: {output_folder_2}")
