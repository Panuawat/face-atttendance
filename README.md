# 🎭 Face Attendance System

ระบบบันทึกการเข้าร่วมด้วยการจำใบหน้า (Face Recognition Attendance System) พัฒนาด้วย Next.js, Prisma, และ face-api.js

## ✨ Features

### 🎯 Core Features
- **Face Recognition**: ตรวจจับและจำใบหน้าด้วย face-api.js
- **Real-time Attendance**: บันทึกการเข้าร่วมแบบ real-time
- **Smart Duplicate Prevention**: ป้องกันการเช็คชื่อซ้ำภายใน 1 นาที

### 👤 User Management
- **Registration**: ลงทะเบียนผู้ใช้ใหม่ด้วยการถ่ายรูปจากกล้อง
- **Multiple Photos**: รองรับการถ่ายหลายรูป (3-5 รูป) เพื่อความแม่นยำ
- **Live Face Detection**: แสดงกรอบหน้าแบบ real-time ขณะถ่ายรูป
- **People Management**: จัดการผู้ใช้ (ดู/ลบ) พร้อมรูปภาพตัวอย่าง

### 📊 Dashboard & Analytics
- **Statistics Cards**: สถิติแบบ real-time (ผู้ใช้ทั้งหมด, เช็คชื่อวันนี้/สัปดาห์นี้/เดือนนี้)
- **Attendance Trend Chart**: กราฟแสดงแนวโน้มการเช็คชื่อ 7 วันล่าสุด
- **Top Users Ranking**: จัดอันดับผู้เข้าร่วมบ่อยที่สุด
- **Recent Activity**: รายการเช็คชื่อล่าสุด 10 รายการ

### 📋 History & Reports
- **Attendance History**: ดูประวัติการเช็คชื่อทั้งหมด
- **Advanced Filtering**: กรองตามชื่อและช่วงวันที่
- **Search**: ค้นหาแบบ real-time

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MySQL Database
- Webcam/Camera

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/face-attendance.git
cd face-attendance
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**

Create `.env` file:
```env
DATABASE_URL="mysql://user:password@localhost:3306/face_attendance"
```

4. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

5. **Download face-api.js models**

Download model files from [face-api.js models](https://github.com/justadudewhohacks/face-api.js/tree/master/weights) and place them in `public/models/`:
- ssd_mobilenetv1_model-weights_manifest.json
- ssd_mobilenetv1_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_landmark_68_model-shard1
- face_recognition_model-weights_manifest.json
- face_recognition_model-shard1

6. **Run development server**
```bash
npm run dev
```

7. **Open browser**
```
http://localhost:3000
```

## 📖 Usage

### 1. Register New User
1. Click "➕ ลงทะเบียนคนใหม่"
2. Allow camera access
3. Position your face in the green box
4. Take 3-5 photos from different angles
5. Enter your name and click "ลงทะเบียน"

### 2. Take Attendance
1. On home page, click "▶ เริ่มสแกน"
2. Face the camera
3. System will detect and recognize your face
4. Attendance will be recorded automatically

### 3. View Dashboard
1. Click "📊 Dashboard"
2. View statistics, trends, and rankings
3. See recent check-ins

### 4. Manage Users
1. Click "👥 จัดการผู้ใช้"
2. View all registered users with photos
3. Delete users if needed (with confirmation)

### 5. View History
1. Click "📋 ดูประวัติการเช็คชื่อ"
2. Filter by name or date range
3. Export or print reports

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MySQL + Prisma ORM
- **Face Recognition**: face-api.js (TensorFlow.js)
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Language**: JavaScript

## 📁 Project Structure

```
face-attendance/
├── app/
│   ├── page.js              # Home (Face Scan)
│   ├── register/            # User Registration
│   ├── people/              # People Management
│   ├── history/             # Attendance History
│   ├── dashboard/           # Dashboard & Analytics
│   └── api/                 # API Routes
│       ├── attendance/      # Get attendance records
│       ├── check-in/        # Record check-in
│       ├── people/          # Manage people
│       │   └── [id]/        # Delete person
│       ├── register/        # Register new person
│       └── stats/           # Dashboard statistics
├── prisma/
│   └── schema.prisma        # Database schema
├── public/
│   ├── models/              # face-api.js models
│   └── labeled_images/      # User photos
└── lib/
    └── prisma.js            # Prisma client
```

## 🗄️ Database Schema

### Person
- `id`: Auto-increment primary key
- `name`: Unique user name
- `photoCount`: Number of registered photos
- `createdAt`: Registration timestamp
- `updatedAt`: Last update timestamp

### Attendance
- `id`: Auto-increment primary key
- `name`: Person name
- `timestamp`: Check-in time
- `status`: Attendance status (default: "present")

## ⚙️ Configuration

### Face Recognition Settings
- **Threshold**: 0.6 (in `app/page.js` line 118)
- **Duplicate Prevention**: 1 minute (in `app/api/check-in/route.js` line 13)
- **Scan Interval**: 1000ms (in `app/page.js` line 170)

### Photo Requirements
- **Format**: JPEG
- **Multiple Photos**: 3-5 recommended
- **Storage**: `/public/labeled_images/{name}/`

## 🎨 Features Roadmap

- [ ] Export data (CSV/Excel)
- [ ] Toast notifications
- [ ] Dark/Light mode
- [ ] Admin authentication
- [ ] Configurable settings page
- [ ] Email notifications
- [ ] PDF reports
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Developed with ❤️ for attendance management

## 🙏 Acknowledgments

- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - Face recognition library
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Recharts](https://recharts.org/) - Charting library
