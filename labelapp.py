import os
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import pandas as pd

# --- Giao diện chính ---
root = tk.Tk()
root.title("Image Labeling Tool")
root.attributes('-fullscreen', True)

# --- Biến toàn cục ---
image_folder = ""
output_csv = ""
images = []
image_index = 0
data = []
labels = ["Normal", "Black", "Broken", "Mold", "Error image"]
zoom_scale = tk.IntVar(value=100)  # Zoom mặc định 100%

# --- Các thành phần giao diện chính ---
progress_label = tk.Label(root, text="", font=("Arial", 16))
main_img_label = tk.Label(root)

# --- Chọn thư mục ảnh ---
def select_image_folder():
    global image_folder, images, image_index, data
    image_folder = filedialog.askdirectory(title="\U0001f4c1 Chọn thư mục ảnh")
    if image_folder:
        images = sorted([f for f in os.listdir(image_folder) if f.lower().endswith(('jpg', 'png', 'jpeg'))])
        image_index = 0
        data = []
        progress_label.config(text=f"✅ Đã chọn {len(images)} ảnh")
    else:
        progress_label.config(text="❌ Chưa chọn thư mục ảnh")

# --- Chọn nơi lưu CSV ---
def select_csv_location():
    global output_csv
    output_csv = filedialog.asksaveasfilename(
        title="\U0001f4be Chọn nơi lưu file labels.csv",
        defaultextension=".csv",
        filetypes=[("CSV files", "*.csv")]
    )
    if output_csv:
        progress_label.config(text="✅ File CSV sẽ được lưu tại: " + os.path.basename(output_csv))
    else:
        progress_label.config(text="❌ Chưa chọn nơi lưu file CSV")

# --- Bắt đầu gán nhãn ---
def start_labeling():
    global images, image_folder, output_csv, image_index, data
    if not image_folder or not output_csv:
        messagebox.showerror("Thiếu thông tin", "Vui lòng chọn thư mục ảnh và vị trí lưu CSV trước.")
        return

    # Nếu đã có file CSV, load lại
    if os.path.exists(output_csv):
        df_old = pd.read_csv(output_csv)
        data = df_old.values.tolist()
        image_index = len(data)

    # Ẩn các nút chọn
    folder_btn.pack_forget()
    csv_btn.pack_forget()
    start_btn.pack_forget()

    # Hiện phần gán nhãn
    progress_label.pack()
    main_img_label.pack()
    zoom_slider.pack()

    for i, label in enumerate(labels):
        btn = tk.Button(root, text=f"{i+1} - {label}", width=20, font=("Arial", 14),
                        command=lambda l=label: assign_label(l))
        btn.pack(pady=3)

    back_btn.pack(pady=5)

    load_image()

# --- Hiển thị ảnh có zoom ---
def load_image():
    global image_index
    if image_index >= len(images):
        messagebox.showinfo("Hoàn tất", "Đã gán nhãn xong toàn bộ ảnh!")
        return

    progress_label.config(text=f"Ảnh {image_index + 1}/{len(images)}")
    img_path = os.path.join(image_folder, images[image_index])
    pil_img = Image.open(img_path)

    zoom = zoom_scale.get() / 100
    w, h = pil_img.size
    pil_img = pil_img.resize((int(w * zoom), int(h * zoom)))

    tk_img = ImageTk.PhotoImage(pil_img)
    main_img_label.configure(image=tk_img)
    main_img_label.image = tk_img

# --- Gán nhãn và lưu ---
def assign_label(label):
    global image_index
    if image_index >= len(images): return
    data.append((images[image_index], label))
    image_index += 1
    save_csv()
    load_image()

def go_back():
    global image_index
    if image_index == 0: return
    image_index -= 1
    data.pop()
    save_csv()
    load_image()

def save_csv():
    if output_csv:
        df = pd.DataFrame(data, columns=["filename", "label"])
        df.to_csv(output_csv, index=False)

def key_press(event):
    key = event.char
    if key.isdigit():
        idx = int(key)
        if 1 <= idx <= len(labels):
            assign_label(labels[idx - 1])
    elif key == '\x1b':  # ESC
        root.attributes('-fullscreen', False)

root.bind("<Key>", key_press)

# --- Giao diện chọn folder và CSV ---
folder_btn = tk.Button(root, text="\U0001f4c1 Chọn thư mục ảnh", font=("Arial", 14), command=select_image_folder)
csv_btn = tk.Button(root, text="\U0001f4be Chọn nơi lưu file CSV", font=("Arial", 14), command=select_csv_location)
start_btn = tk.Button(root, text="🚀 Bắt đầu gán nhãn", font=("Arial", 16), bg="green", fg="white", command=start_labeling)
back_btn = tk.Button(root, text="↩️ Quay lại", fg="red", font=("Arial", 12), command=go_back)

zoom_slider = tk.Scale(root, from_=50, to=200, orient="horizontal", label="Zoom (%)", variable=zoom_scale, command=lambda val: load_image())

folder_btn.pack(pady=10)
csv_btn.pack(pady=10)
start_btn.pack(pady=20)
progress_label.pack()

# --- Khi thoát ---
def on_close():
    try:
        save_csv()
    except:
        pass  # Không sao nếu chưa chọn file CSV
    root.destroy()

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()
