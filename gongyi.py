import tkinter as tk
from tkinter import messagebox, simpledialog
from PIL import Image, ImageTk

class ProcessCalcUI:
    def __init__(self, root):
        self.root = root
        self.root.title("杨铜电气-工艺单计算系统")
        self.root.geometry("800x600")

        # 设置背景图片（若无需背景图，注释此段并恢复默认背景色）
        try:
            self.set_background("bg_image.png")
        except:
            self.root.configure(bg="#0086b3")

        # 层级容器
        self.level_frames = {}
        self._create_level_frames()

        # 顶级主按钮
        main_btn = tk.Button(
            self.root, text="工艺单计算", font=("Arial", 16, "bold"),
            bg="#003366", fg="white", width=20, command=self.show_standard_level
        )
        main_btn.place(relx=0.5, rely=0.1, anchor=tk.CENTER)

        self.hide_all_levels()

    def set_background(self, image_path):
        """设置背景图片"""
        image = Image.open(image_path)
        image = image.resize((800, 600), Image.Resampling.LANCZOS)
        self.bg_photo = ImageTk.PhotoImage(image)
        bg_label = tk.Label(self.root, image=self.bg_photo)
        bg_label.place(x=0, y=0, relwidth=1, relheight=1)

    def _create_level_frames(self):
        """创建层级框架"""
        self.level_frames["standard"] = tk.Frame(self.root, bg="#0086b3", bd=0)
        self.level_frames["calc_type"] = tk.Frame(self.root, bg="#0086b3", bd=0)
        self.level_frames["params"] = tk.Frame(self.root, bg="#0086b3", bd=0)

    def hide_all_levels(self):
        """隐藏所有子层级"""
        for frame in self.level_frames.values():
            frame.place_forget()

    def show_standard_level(self):
        """显示沈变/衡变标准"""
        self.hide_all_levels()
        frame = self.level_frames["standard"]
        frame.place(relx=0.5, rely=0.3, anchor=tk.CENTER)

        for widget in frame.winfo_children():
            widget.destroy()

        tk.Button(
            frame, text="沈变标准", font=("Arial", 14, "bold"),
            bg="#004d99", fg="white", width=15,
            command=lambda: self.show_calc_type_level("沈变标准")
        ).grid(row=0, column=0, padx=20)

        tk.Button(
            frame, text="衡变标准", font=("Arial", 14, "bold"),
            bg="#004d99", fg="white", width=15,
            command=lambda: self.show_calc_type_level("衡变标准")
        ).grid(row=0, column=1, padx=20)

    def show_calc_type_level(self, standard_type):
        """显示单参数/全参数计算"""
        self.hide_all_levels()
        frame = self.level_frames["calc_type"]
        frame.place(relx=0.5, rely=0.4, anchor=tk.CENTER)

        for widget in frame.winfo_children():
            widget.destroy()

        tk.Button(
            frame, text="单参数计算", font=("Arial", 12, "bold"),
            bg="#0066cc", fg="white", width=12,
            command=lambda: self.show_params_level(standard_type, "单参数")
        ).grid(row=0, column=0, padx=15)

        tk.Button(
            frame, text="全参数计算", font=("Arial", 12, "bold"),
            bg="#0066cc", fg="white", width=12,
            command=lambda: self.show_params_level(standard_type, "全参数")
        ).grid(row=0, column=1, padx=15)

        tk.Button(
            frame, text="返回", font=("Arial", 10),
            bg="#666666", fg="white", width=8,
            command=self.show_standard_level
        ).grid(row=0, column=2, padx=15)

    def show_params_level(self, standard_type, calc_type):
        """显示具体参数项"""
        self.hide_all_levels()
        frame = self.level_frames["params"]
        frame.place(relx=0.5, rely=0.5, anchor=tk.CENTER)

        for widget in frame.winfo_children():
            widget.destroy()

        # 匹配图片中的参数项
        params = [
            "a边漆膜厚度", "b边漆膜厚度",
            "a边挤压模具尺寸", "b边挤压模具尺寸"
        ]
        for idx, param in enumerate(params):
            tk.Button(
                frame, text=param, font=("Arial", 10, "bold"),
                bg="#3399ff", fg="white", width=18,
                command=lambda p=param, s=standard_type, c=calc_type: self.calc_param(p, s, c)
            ).grid(row=idx//2, column=idx%2, padx=10, pady=8)

        tk.Button(
            frame, text="返回", font=("Arial", 10),
            bg="#666666", fg="white", width=8,
            command=lambda: self.show_calc_type_level(standard_type)
        ).grid(row=2, column=0, columnspan=2, pady=10)

    def get_input_value(self, prompt):
        """获取用户输入的工艺参数"""
        while True:
            try:
                value = simpledialog.askfloat("参数输入", prompt)
                if value is None:  # 用户取消输入
                    return None
                return value
            except:
                messagebox.showerror("输入错误", "请输入有效的数字！")

    def calc_param(self, param, standard_type, calc_type):
        """核心计算逻辑：整合电磁线工艺公式"""
        result = None
        if param == "a边漆膜厚度":
            # 公式：a边漆膜厚度 = {a边换位线厚度 - [a边裸线厚度×(n+1)/2 + 绝缘纸厚度]}/((n+1)/2)
            n = self.get_input_value("请输入导线根数n：")  # 导线根数
            a_h_change = self.get_input_value("请输入a边换位线厚度(mm)：")
            a_h_bare = self.get_input_value("请输入a边裸线厚度(mm)：")
            paper_h = self.get_input_value("请输入绝缘纸厚度(mm)：")
            if all(v is not None for v in [a_h_change, a_h_bare, paper_h]):
                result = (a_h_change - (a_h_bare * (n + 1) / 2 + paper_h))/((n+1)/2)
                result = round(result, 2)  # 保留2位小数

        elif param == "b边漆膜厚度":
            # 公式：b边漆膜厚度 = [b边换位线厚度 - (b边裸线厚度×2 + 绝缘纸厚度 + 中心纸厚度)] / 2
            b_h_change = self.get_input_value("请输入b边换位线厚度(mm)：")
            b_h_bare = self.get_input_value("请输入b边裸线厚度(mm)：")
            paper_h = self.get_input_value("请输入绝缘纸厚度(mm)：")
            center_paper_h = self.get_input_value("请输入中心纸厚度(mm)：")
            if all(v is not None for v in [b_h_change, b_h_bare, paper_h, center_paper_h]):
                result = (b_h_change - (b_h_bare * 2 + paper_h + center_paper_h)) / 2
                result = round(result, 4)

        elif param == "a边挤压模具尺寸":
            # 公式：a边挤压模具尺寸 = a边裸线厚度 + a边收缩比 + 预留模拉硬度
            a_h_bare = self.get_input_value("请输入a边裸线厚度(mm)：")
            a_shrink = self.get_input_value("请输入a边收缩比(mm)：")
            a_reserve = self.get_input_value("请输入a边预留模拉硬度(mm)：")
            if all(v is not None for v in [a_h_bare, a_shrink, a_reserve]):
                result = a_h_bare + a_shrink + a_reserve
                result = round(result, 4)

        elif param == "b边挤压模具尺寸":
            # 公式：b边挤压模具尺寸 = b边裸线厚度 + b边收缩比 + 预留模拉硬度
            b_h_bare = self.get_input_value("请输入b边裸线厚度(mm)：")
            b_shrink = self.get_input_value("请输入b边收缩比(mm)：")
            b_reserve = self.get_input_value("请输入b边预留模拉硬度(mm)：")
            if all(v is not None for v in [b_h_bare, b_shrink, b_reserve]):
                result = b_h_bare + b_shrink + b_reserve
                result = round(result, 4)

        # 显示计算结果
        if result is not None:
            msg = f"【{standard_type}】-{calc_type}\n{param}计算结果：\n{result} mm"
            messagebox.showinfo("计算结果", msg)
        else:
            messagebox.warning("计算中断", "参数输入不完整，计算终止！")

if __name__ == "__main__":
    root = tk.Tk()
    app = ProcessCalcUI(root)
    root.mainloop()