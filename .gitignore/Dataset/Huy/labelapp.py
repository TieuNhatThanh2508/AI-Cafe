import os
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import pandas as pd

# --- Cấu hình ---
image_folder = "dataset"
labels = ["Normal", "Black", "Broken", "Mold"]
output_csv = "labels.csv"

# --- Tải ảnh ---
images = sorted([f for f in os.listdir(image_folder) if f.lower().endswith(('jpg', 'png', 'jpeg'))])
image_index = 0
data = []

# --- Nếu có file nhãn cũ, tải lại ---
if os.path.exists(output_csv):
    df_old = pd.read_csv(output_csv)
    data = df_old.values.tolist()
    image_index = len(data)

# --- Giao diện ---
root = tk.Tk()
root.title("Gán nhãn ảnh (Image Labeling Tool)")

# Hiển thị tiến độ
progress_label = tk.Label(root, text="")
progress_label.pack()

# Ảnh chính
main_img_label = tk.Label(root)
main_img_label.pack()

# Ảnh trước đó (preview nhỏ)
prev_img_label = tk.Label(root)
prev_img_label.pack()

# --- Cập nhật ảnh ---
def load_image():
    global image_index
    if image_index >= len(images):
        messagebox.showinfo("Hoàn tất", "Bạn đã gán nhãn xong toàn bộ ảnh!")
        return

    # Cập nhật tiến độ
    progress_label.config(text=f"Ảnh {image_index+1}/{len(images)}")

    # Ảnh chính
    img_path = os.path.join(image_folder, images[image_index])
    pil_img = Image.open(img_path).resize((400, 400))
    tk_img = ImageTk.PhotoImage(pil_img)
    main_img_label.configure(image=tk_img)
    main_img_label.image = tk_img

    # Ảnh preview
    if image_index > 0:
        prev_path = os.path.join(image_folder, images[image_index - 1])
        prev_img = Image.open(prev_path).resize((150, 150))
        prev_tk = ImageTk.PhotoImage(prev_img)
        prev_img_label.configure(image=prev_tk)
        prev_img_label.image = prev_tk
    else:
        prev_img_label.config(image="")

# --- Gán nhãn và lưu ---
def assign_label(label):
    global image_index
    if image_index >= len(images):
        return
    data.append((images[image_index], label))
    image_index += 1
    save_csv()
    load_image()

# --- Quay lại ---
def go_back():
    global image_index
    if image_index == 0:
        return
    image_index -= 1
    data.pop()
    save_csv()
    load_image()

# --- Lưu file CSV ---
def save_csv():
    df = pd.DataFrame(data, columns=["filename", "label"])
    df.to_csv(output_csv, index=False)

# --- Gán nhãn bằng phím tắt ---
def key_press(event):
    key = event.char
    if key.isdigit():
        idx = int(key)
        if 1 <= idx <= len(labels):
            assign_label(labels[idx])

root.bind("<Key>", key_press)

# --- Nút nhãn ---
for i, label in enumerate(labels):
    btn = tk.Button(root, text=f"{i} - {label}", width=20, command=lambda l=label: assign_label(l))
    btn.pack(pady=1)

# --- Nút Quay lại ---
back_btn = tk.Button(root, text="↩️ Quay lại", fg="red", command=go_back)
back_btn.pack(pady=5)

# --- Khi thoát ---
def on_close():
    save_csv()
    root.destroy()

root.protocol("WM_DELETE_WINDOW", on_close)

# --- Chạy lần đầu ---
load_image()
root.mainloop()
