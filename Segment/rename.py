import os

# Thư mục chứa ảnh
folder = "./input"

# Lấy danh sách các file ảnh .jpg/.jpeg/.png bất kể viết hoa/thường
image_files = sorted(
    [f for f in os.listdir(folder) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
)

# Đảm bảo sắp xếp ổn định (ví dụ dùng thời gian tạo nếu cần)
image_files.sort(key=lambda f: os.path.getctime(os.path.join(folder, f)))

# Đổi tên lần lượt từ 1 -> N
for idx, filename in enumerate(image_files, start=1):
    ext = os.path.splitext(filename)[1].lower()
    new_name = f"{idx:03d}{ext}"
    
    src = os.path.join(folder, filename)
    dst = os.path.join(folder, new_name)
    
    os.rename(src, dst)
    print(f"Đã đổi: {filename} -> {new_name}")

print(f"✅ Hoàn tất: {len(image_files)} ảnh đã được đổi tên.")
