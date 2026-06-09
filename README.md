# 🏋️ Iron & Forge — Gym Harmony System

Hệ thống quản lý phòng gym toàn diện với giao diện web hiện đại, API server, và cơ sở dữ liệu PostgreSQL.

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy bạn đã cài đặt:

| Công cụ | Phiên bản tối thiểu | Cách kiểm tra |
|---------|-------------------|---------------|
| [Node.js](https://nodejs.org/) | v20+ | `node -v` |
| [pnpm](https://pnpm.io/) | v9+ | `pnpm -v` |
| PostgreSQL (hoặc tài khoản [Neon](https://neon.tech)) | — | — |

> **Cài pnpm nhanh:** `npm install -g pnpm`

---

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1 — Clone repo

```bash
git clone https://github.com/minh160905/Gym-Management-System.git
cd Gym-Management-System
```

### Bước 2 — Tạo file `.env`

Tạo file `.env` ở thư mục gốc (cùng cấp với `package.json`):

```bash
# Tạo file .env
copy .env.example .env   # Windows
# hoặc
cp .env.example .env     # macOS/Linux
```

Sau đó mở file `.env` và điền thông tin kết nối database:

```env
DATABASE_URL=postgresql://neondb_owner:npg_AybSP4JgNG8o@ep-rough-unit-aqdr0a6f.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require
PGDATABASE=neondb
PGHOST=ep-rough-unit-aqdr0a6f.c-8.us-east-1.aws.neon.tech
PGPORT=5432
PGUSER=neondb_owner
PGPASSWORD=npg_AybSP4JgNG8o
```

### Bước 3 — Cài đặt dependencies

```bash
pnpm install
```

### Bước 4 — Khởi tạo Database (tạo các bảng)

```bash
pnpm --filter @workspace/db run push
```

Lệnh này sẽ tạo toàn bộ các bảng cần thiết trong database của bạn.

### Bước 5 — Tạo tài khoản mẫu (Demo Accounts)

Chạy lệnh sau để chèn 4 tài khoản demo vào database. Script này cần chạy từ thư mục `lib/db` để Node.js tìm được thư viện `pg`:

**Windows (PowerShell):**
```powershell
cd lib\db

node -e "
const { Pool } = require('pg');
const crypto = require('crypto');
const pool = new Pool({ connectionString: process.env.DATABASE_URL || require('fs').readFileSync('../../.env','utf8').match(/DATABASE_URL=(.+)/)[1].trim() });
const hash = p => crypto.createHash('sha256').update(p).digest('hex');
const users = [
  ['owner',    hash('admin123'), 'Owner Admin', 'owner'],
  ['manager',  hash('admin123'), 'Manager',     'manager'],
  ['trainer',  hash('admin123'), 'Trainer',     'trainer'],
  ['customer', hash('admin123'), 'Customer',    'customer'],
];
(async () => {
  for (const [u, h, n, r] of users) {
    try {
      await pool.query('INSERT INTO users (username,password_hash,full_name,role) VALUES (\$1,\$2,\$3,\$4) ON CONFLICT (username) DO NOTHING', [u,h,n,r]);
      console.log('OK:', u);
    } catch(e) { console.error('ERR:', u, e.message); }
  }
  await pool.end();
})();
"

cd ../..
```

Sau khi chạy xong bạn có thể đăng nhập với:

| Role | Username | Password |
|------|----------|----------|
| Owner | `owner` | `admin123` |
| Manager | `manager` | `admin123` |
| Trainer | `trainer` | `admin123` |
| Customer | `customer` | `admin123` |

### Bước 6 — Chạy ứng dụng

```bash
pnpm --filter @workspace/api-server --filter @workspace/gym-management run dev
```

Sau khi khởi động xong, mở trình duyệt và truy cập:

- 🌐 **Giao diện web:** [http://localhost:5173](http://localhost:5173)
- 🔌 **API server:** [http://localhost:3000](http://localhost:3000)

---

## 📁 Cấu trúc dự án

```
Gym-Harmony-System/
├── artifacts/
│   ├── api-server/          # Express.js backend API
│   └── gym-management/      # React + Vite frontend
├── lib/
│   ├── api-client-react/    # React hooks tự động sinh cho API
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Zod schemas cho API
│   └── db/                  # Drizzle ORM + PostgreSQL schema
├── scripts/                 # Utility scripts
├── .env                     # ⚠️ Biến môi trường (KHÔNG commit lên git)
├── .env.example             # Mẫu file .env
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # pnpm workspace config
```

---

## 🛠️ Các lệnh hữu ích

| Lệnh | Mô tả |
|------|-------|
| `pnpm install` | Cài đặt tất cả dependencies |
| `pnpm --filter @workspace/api-server run dev` | Chạy chỉ backend |
| `pnpm --filter @workspace/gym-management run dev` | Chạy chỉ frontend |
| `pnpm --filter @workspace/db run push` | Đồng bộ schema DB |
| `pnpm --filter @workspace/db run push-force` | Đồng bộ bắt buộc (xóa dữ liệu cũ) |
| `pnpm build` | Build toàn bộ project |

---

## 🔑 Roles trong hệ thống

| Role | Quyền hạn |
|------|-----------|
| **Owner** | Quản lý toàn bộ: members, staff, gói tập, doanh thu |
| **Manager** | Quản lý lịch lớp, điểm danh, thiết bị, phản hồi |
| **Trainer** | Xem lịch, quản lý workout, khách hàng PT |
| **Customer** | Đăng ký lớp, xem lịch sử tập, thuê PT, thanh toán |

---

## ⚠️ Lưu ý quan trọng

- **Không commit file `.env`** — File này chứa thông tin đăng nhập database nhạy cảm và đã được thêm vào `.gitignore`.
- Khi deploy production, thay đổi mật khẩu các tài khoản demo ngay lập tức.
- Database sử dụng **PostgreSQL** — có thể dùng bất kỳ provider nào hỗ trợ PostgreSQL (Neon, Supabase, Railway, local, v.v.).
