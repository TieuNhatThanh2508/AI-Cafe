import cv2
import numpy as np
import os

def get_next_index(output_folder):
    """Lấy số thứ tự tiếp theo để lưu file tránh ghi đè."""
    existing_files = [f for f in os.listdir(output_folder) if f.endswith(".png")]
    indices = [int(f.split(".")[0]) for f in existing_files if f.split(".")[0].isdigit()]
    return max(indices, default=0) + 1

# Thư mục chứa ảnh đầu vào và đầu ra
input_folder = "Input"
output_folder = "Output_large_img"
output_folder_2 = "Output_each_bean"

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

        # Phát hiện biên bằng Otsu
        _, thresh = cv2.threshold(filtered, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # Loại nhiễu nhỏ
        kernel = np.ones((3, 3), np.uint8)
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)

        # Xác định vùng chắc chắn là background
        sure_bg = cv2.dilate(opening, kernel, iterations=3)

        # Xác định vùng chắc chắn là foreground
        dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)
        _, sure_fg = cv2.threshold(dist_transform, 0.4 * dist_transform.max(), 255, 0)

        # Xác định vùng không chắc chắn
        sure_fg = np.uint8(sure_fg)
        unknown = cv2.subtract(sure_bg, sure_fg)

        # Gán nhãn marker
        _, markers = cv2.connectedComponents(sure_fg)
        markers = markers + 1
        markers[unknown == 255] = 0

        # Áp dụng watershed
        markers = cv2.watershed(image, markers)

        image_with_boxes = image.copy()

        for marker in range(2, np.max(markers) + 1):
            mask = np.uint8(markers == marker)
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for cnt in contours:
                x, y, w, h = cv2.boundingRect(cnt)
                if 60 < w < 400 and 60 < h < 400:
                    # Tính toán khung vuông
                    size = max(w, h)
                    cx, cy = x + w // 2, y + h // 2
                    x1 = max(cx - size // 2 - 5, 0)
                    y1 = max(cy - size // 2 - 5, 0)
                    x2 = min(cx + size // 2 + 5, image.shape[1])
                    y2 = min(cy + size // 2 + 5, image.shape[0])

                    # Vẽ khung
                    cv2.rectangle(image_with_boxes, (x1, y1), (x2, y2), (0, 255, 0), 2)

                    # Cắt hạt cà phê
                    bean = image[y1:y2, x1:x2].copy()
                    bean_output_path = os.path.join(output_folder_2, f"{next_index}.png")
                    cv2.imwrite(bean_output_path, bean)
                    next_index += 1

        # Lưu ảnh đã vẽ box
        cv2.imwrite(output_path, image_with_boxes)

    print(f"Ảnh đã được xử lý và lưu tại: {output_folder}")
    print(f"Hạt cà phê đã lưu tại: {output_folder_2}")