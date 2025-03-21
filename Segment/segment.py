import cv2
import numpy as np
import os

# Tham số đầu vào
INPUT_DIR = "./input"
OUTPUT_DIR = "./output"
GAUSSIAN_BLUR_KERNEL = (5, 5)
THRESH_BLOCK_SIZE = 11
THRESH_C = 2
MORPH_KERNEL_SIZE = (3, 3)
AREA_MIN = 500
AREA_MAX = 5000
ASPECT_RATIO_MIN = 0.5
ASPECT_RATIO_MAX = 2.0
RESIZE_DIM = 224
SHARPEN_KERNEL = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])


def segment_coffee_beans():
    # Tạo thư mục output nếu chưa có
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Lấy danh sách tất cả ảnh trong thư mục input
    image_files = [f for f in os.listdir(
        INPUT_DIR) if f.lower().endswith(('png', 'jpg', 'jpeg'))]

    # Tìm số thứ tự hiện có để tránh ghi đè
    existing_files = [int(f.split('.')[0])
                      for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')]
    next_index = max(existing_files) + 1 if existing_files else 1

    for image_file in image_files:
        image_path = os.path.join(INPUT_DIR, image_file)
        image = cv2.imread(image_path)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Làm mờ ảnh để giảm nhiễu
        blurred = cv2.GaussianBlur(gray, GAUSSIAN_BLUR_KERNEL, 0)

        # Dùng adaptive threshold để tách hạt cà phê
        thresh = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                       cv2.THRESH_BINARY_INV, THRESH_BLOCK_SIZE, THRESH_C)

        # Loại bỏ nhiễu bằng Morphological operations
        kernel = np.ones(MORPH_KERNEL_SIZE, np.uint8)
        thresh = cv2.morphologyEx(
            thresh, cv2.MORPH_CLOSE, kernel, iterations=2)

        # Tìm contours của hạt cà phê
        contours, _ = cv2.findContours(
            thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        # Lặp qua từng contour và lưu ảnh
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = w / h
            area = cv2.contourArea(contour)

            # Chỉ lấy những hạt có kích thước hợp lý và tỉ lệ khung hình hợp lý
            if AREA_MIN < area < AREA_MAX and ASPECT_RATIO_MIN < aspect_ratio < ASPECT_RATIO_MAX:
                bean = image[y:y+h, x:x+w]

                # Giữ nguyên tỷ lệ hạt cà phê bằng cách thêm padding
                max_dim = max(w, h)
                padded_bean = np.ones(
                    (max_dim, max_dim, 3), dtype=np.uint8) * 255
                x_offset = (max_dim - w) // 2
                y_offset = (max_dim - h) // 2
                padded_bean[y_offset:y_offset+h, x_offset:x_offset+w] = bean

                # Resize về kích thước chuẩn
                bean_resized = cv2.resize(
                    padded_bean, (RESIZE_DIM, RESIZE_DIM))

                # Tăng độ sắc nét
                bean_sharpened = cv2.filter2D(bean_resized, -1, SHARPEN_KERNEL)

                output_path = os.path.join(OUTPUT_DIR, f"{next_index}.png")
                cv2.imwrite(output_path, bean_sharpened)
                next_index += 1

    print(
        f"Processed {len(image_files)} images and saved segmented beans to {OUTPUT_DIR}")


# Chạy thử chương trình
segment_coffee_beans()
