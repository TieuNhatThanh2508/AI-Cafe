import cv2
import numpy as np
import os
import json

# CẤU HÌNH
input_folder = "./input"
output_folder = "./output"
output_folder_2 = "./output_2"
json_output_path = "./bounding_boxes.json"
min_size = 60
max_size = 300
padding = 15


def get_next_index(output_folder):
    existing_files = [f for f in os.listdir(
        output_folder) if f.endswith(".png")]
    indices = [int(f.split(".")[0])
               for f in existing_files if f.split(".")[0].isdigit()]
    return max(indices, default=0) + 1


# CHUẨN BỊ
os.makedirs(output_folder, exist_ok=True)
os.makedirs(output_folder_2, exist_ok=True)

image_files = [f for f in os.listdir(
    input_folder) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
if not image_files:
    print("❌ Không tìm thấy ảnh nào trong thư mục input.")
    exit()

all_data = {}
next_index = get_next_index(output_folder_2)

# XỬ LÝ ẢNH
for filename in image_files:
    input_path = os.path.join(input_folder, filename)
    output_path = os.path.join(output_folder, filename)
    image = cv2.imread(input_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    filtered = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
    _, thresh = cv2.threshold(
        filtered, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    thresh = cv2.dilate(thresh, np.ones((5, 5), np.uint8), iterations=2)

    contours, _ = cv2.findContours(
        thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    sorted_contours = sorted(contours, key=lambda c: (
        cv2.boundingRect(c)[1], cv2.boundingRect(c)[0]))

    image_with_boxes = image.copy()
    coordinates = {}
    bean_count = 1
    filename_no_ext = os.path.splitext(filename)[0]

    for contour in sorted_contours:
        x, y, w, h = cv2.boundingRect(contour)
        if max_size ** 2 > w * h > min_size ** 2:
            x1, y1 = max(x - padding, 0), max(y - padding, 0)
            x2, y2 = min(x + w + padding,
                         image.shape[1]), min(y + h + padding, image.shape[0])

            # Vẽ và đánh số
            cv2.rectangle(image_with_boxes, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(image_with_boxes, f"{bean_count}", (x1 + 5, y1 + 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

            # Cắt và lưu ảnh hạt
            bean = image[y1:y2, x1:x2]
            bean_filename = f"{int(filename_no_ext):03d}_{bean_count:03d}.jpg"
            cv2.imwrite(os.path.join(output_folder_2, bean_filename), bean)

            # Lưu trực tiếp với key đúng định dạng ảnh
            all_data[bean_filename] = {
                "coor": [int(x1), int(y1), int(x2), int(y2)],
                "label": []
            }

            bean_count += 1

    # Lưu ảnh có khung và dữ liệu JSON
    cv2.imwrite(output_path, image_with_boxes)
    all_data[filename] = coordinates

# GHI FILE JSON
with open(json_output_path, "w", encoding="utf-8") as f:
    json.dump(all_data, f, indent=4, ensure_ascii=False)

print(f"✅ Đã xử lý {len(image_files)} ảnh.")
print(f"🖼 Ảnh có khung: {output_folder}")
print(f"🌱 Ảnh từng hạt: {output_folder_2}")
print(f"📄 Tọa độ lưu tại: {json_output_path}")
