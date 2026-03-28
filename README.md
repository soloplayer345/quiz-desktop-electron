# Quiz Desktop

Ứng dụng ôn thi trắc nghiệm chạy trên máy tính, xây dựng bằng **React + Vite + Electron**.

---

## Tính năng

- Quản lý môn học (thêm, sửa, xóa)
- Nhập câu hỏi trắc nghiệm nhiều đáp án
- Luyện tập ôn thi với chế độ Study
- **Xuất/nhập bộ câu hỏi dưới dạng file `.quiz.json`** để chia sẻ
- Thông báo kết quả thao tác (toast notification)
- Lưu dữ liệu cục bộ tự động (localStorage)

---

## Yêu cầu

| Công cụ | Phiên bản tối thiểu |
|---|---|
| [Node.js](https://nodejs.org/) | 18+ |
| [Bun](https://bun.sh/) | 1.0+ |
| Git | bất kỳ |

> Có thể dùng `npm` hoặc `yarn` thay cho `bun`, chỉ cần thay lệnh tương ứng.

---

## Cài đặt

```bash
git clone https://github.com/soloplayer345/quiz-desktop-electron.git
cd quiz-desktop-electron
bun install
```

---

## Chạy ở chế độ phát triển

```bash
bun run dev
```

Lệnh này khởi động đồng thời Vite dev server (cổng 5173) và cửa sổ Electron. Hot-reload hoạt động tự động khi chỉnh sửa code.

---

## Xuất ra ứng dụng hoàn chỉnh (Đóng gói)

### Bước 1 — Cài electron-builder

```bash
bun add -D electron-builder
```

### Bước 2 — Thêm cấu hình vào `package.json`

Mở `package.json`, thêm các phần sau:

```json
{
  "scripts": {
    "dist": "vite build && electron-builder"
  },
  "build": {
    "appId": "com.soloplayer345.quiz-desktop",
    "productName": "Quiz Desktop",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "public/icon.icns"
    },
    "linux": {
      "target": "AppImage",
      "icon": "public/icon.png"
    }
  }
}
```

> **Lưu ý icon:** Nếu chưa có file icon, bỏ các dòng `"icon"` trong cấu hình hoặc thêm ảnh vào thư mục `public/`.

### Bước 3 — Build

```bash
bun run dist
```

File cài đặt sẽ xuất hiện trong thư mục **`release/`**:

| Hệ điều hành | File đầu ra |
|---|---|
| Windows | `release/Quiz Desktop Setup x.x.x.exe` |
| macOS | `release/Quiz Desktop-x.x.x.dmg` |
| Linux | `release/Quiz Desktop-x.x.x.AppImage` |

---

## Các lệnh hữu ích khác

| Lệnh | Mô tả |
|---|---|
| `bun run build` | Chỉ build phần web (Vite), kết quả trong `dist/` |
| `bun run start` | Chạy Electron với bản build trong `dist/` (không cần dev server) |
| `bun run preview` | Xem trước bản build web trên trình duyệt |
| `bun run lint` | Kiểm tra lỗi ESLint |

---

## Cấu trúc thư mục

```
quiz-desktop-electron/
├── electron/
│   ├── main.cjs        # Electron main process
│   └── preload.cjs     # Context bridge
├── src/
│   ├── components/
│   │   ├── Hero/       # Banner tiêu đề
│   │   ├── Panel/      # Khung nội dung
│   │   ├── Tabs/       # Thanh điều hướng
│   │   └── Toast/      # Thông báo thao tác
│   ├── modules/
│   │   ├── subjects/   # Quản lý môn học
│   │   ├── questions/  # Nhập câu hỏi
│   │   └── study/      # Luyện tập
│   ├── styles/         # SCSS global (biến, theme, animation)
│   └── utils/
│       ├── helpers.js  # Tạo ID ngẫu nhiên
│       ├── storage.js  # Đọc/ghi localStorage
│       └── transfer.js # Xuất/nhập file JSON
├── public/
├── package.json
└── vite.config.js
```

---

## Định dạng file chia sẻ quiz (`.quiz.json`)

```json
{
  "version": 1,
  "name": "Tên môn học",
  "questions": [
    {
      "prompt": "Nội dung câu hỏi?",
      "options": [
        { "text": "Đáp án A", "correct": true },
        { "text": "Đáp án B", "correct": false },
        { "text": "Đáp án C", "correct": false }
      ]
    }
  ]
}
```

File này có thể tạo thủ công hoặc xuất từ ứng dụng, sau đó chia sẻ và nhập vào máy khác.
