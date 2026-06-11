# USE CASE SPECIFICATION

## Tổng quan hệ thống

- Mục tiêu hệ thống
  - Hệ thống quản lý phòng gym toàn diện cho phép quản lý thành viên, nhân sự, lớp học, huấn luyện viên cá nhân, thiết bị, thanh toán, phản hồi và phân tích hiệu quả hoạt động.
  - Cung cấp giao diện dành cho các vai trò chủ sở hữu (owner), quản lý (manager), huấn luyện viên (trainer) và khách hàng (customer).

- Đối tượng sử dụng
  - Owner: người sở hữu hoặc quản lý cấp cao của phòng gym.
  - Manager: người điều hành vận hành hàng ngày, quản lý thành viên, lớp học, thiết bị và điểm danh.
  - Trainer: huấn luyện viên cá nhân / chuyên viên hướng dẫn.
  - Customer: khách hàng đăng ký thành viên, tham gia lớp, thuê PT, thanh toán và gửi phản hồi.
  - Guest: người chưa đăng nhập truy cập trang landing và thực hiện đăng ký/đăng nhập.

- Bài toán nghiệp vụ giải quyết
  - Quản lý thông tin thành viên và gói thành viên.
  - Điều phối lớp học, đăng ký lớp, theo dõi số lượng học viên.
  - Quản lý huấn luyện viên và lịch PT.
  - Theo dõi buổi tập PT, đánh giá và lịch sử tập luyện.
  - Quản lý thiết bị, bảo trì và trạng thái hoạt động của thiết bị.
  - Xử lý thanh toán và ghi nhận doanh thu.
  - Thu thập phản hồi khách hàng và xử lý hỗ trợ.
  - Cung cấp bảng điều khiển phân tích cho owner.

- Các module chính
  - Authentication
  - Member Management
  - Staff Management
  - Class Management
  - Booking Management
  - Personal Training / Session Management
  - Workout Plan Management
  - Attendance Management
  - Membership Plan Management
  - Equipment Management
  - Payment Management
  - Feedback Management
  - Analytics & Dashboard
  - System Health

---

## Danh sách Actor
Với mỗi Actor:

### ACT-01 - Owner
Thuộc tính | Giá trị
--- | ---
Tên Actor | Owner
Vai trò | Quản trị viên cao nhất của phòng gym
Mô tả | Quản lý toàn bộ hệ thống, gói thành viên, nhân sự, thiết bị và phân tích hiệu quả vận hành.
Quyền hạn | Tạo/sửa/xóa gói thành viên; xem báo cáo phân tích; xem và quản lý nhân sự; truy cập dashboard owner.
Module sử dụng | Authentication, Member Management, Staff Management, Membership Plan Management, Equipment Management, Analytics & Dashboard
Các chức năng thực hiện:
- Quản lý gói thành viên
- Theo dõi dashboard tổng quan
- Quản lý nhân sự và thiết bị
- Truy cập báo cáo doanh thu và thành viên

### ACT-02 - Manager
Thuộc tính | Giá trị
--- | ---
Tên Actor | Manager
Vai trò | Người điều hành vận hành hàng ngày
Mô tả | Quản lý lớp học, danh sách thành viên, điểm danh, phản hồi và thiết bị vận hành.
Quyền hạn | Tạo/sửa lớp; quản lý thành viên; quản lý thiết bị; theo dõi attendance và feedback.
Module sử dụng | Authentication, Member Management, Class Management, Attendance Management, Equipment Management, Feedback Management
Các chức năng thực hiện:
- Quản lý lớp học
- Quản lý attendance
- Quản lý thiết bị
- Xem phản hồi của khách hàng

### ACT-03 - Trainer
Thuộc tính | Giá trị
--- | ---
Tên Actor | Trainer
Vai trò | Huấn luyện viên cá nhân
Mô tả | Quản lý khách hàng PT, lịch buổi tập, kế hoạch tập luyện và hồ sơ cá nhân.
Quyền hạn | Xem danh sách khách hàng; tạo và đánh giá buổi tập PT; quản lý kế hoạch workout; cập nhật profile.
Module sử dụng | Authentication, Personal Training / Session Management, Workout Plan Management, Staff Management
Các chức năng thực hiện:
- Quản lý buổi tập PT
- Xem khách hàng PT
- Tạo/điều chỉnh workout plan
- Cập nhật thông tin cá nhân

### ACT-04 - Customer
Thuộc tính | Giá trị
--- | ---
Tên Actor | Customer
Vai trò | Khách hàng phòng gym
Mô tả | Tham gia lớp học, thuê PT, thanh toán, xem lịch tập, cập nhật profile và gửi feedback.
Quyền hạn | Đăng ký lớp; hủy booking; thuê PT; thanh toán; xem lịch và profile; gửi phản hồi.
Module sử dụng | Authentication, Booking Management, Personal Training / Session Management, Membership Plan Management, Payment Management, Feedback Management, Member Management
Các chức năng thực hiện:
- Đăng ký/hủy lớp học
- Thuê PT và thanh toán
- Cập nhật profile thành viên
- Gửi phản hồi

### ACT-05 - Guest
Thuộc tính | Giá trị
--- | ---
Tên Actor | Guest
Vai trò | Người dùng chưa đăng nhập
Mô tả | Truy cập trang landing, đăng ký tài khoản hoặc đăng nhập.
Quyền hạn | Xem giao diện landing; thực hiện đăng nhập/đăng ký; xem giới thiệu.
Module sử dụng | Authentication
Các chức năng thực hiện:
- Đăng nhập
- Đăng ký tài khoản
- Lấy lại mật khẩu

### ACT-06 - System
Thuộc tính | Giá trị
--- | ---
Tên Actor | System
Vai trò | Xử lý kiểm tra sức khỏe API
Mô tả | Kiểm tra trạng thái backend để đảm bảo server hoạt động.
Quyền hạn | Truy vấn endpoint healthz
Module sử dụng | System Health
Các chức năng thực hiện:
- Kiểm tra trạng thái hệ thống API

---

## Ma trận Actor - Use Case
Actor | Use Case | Module
--- | --- | ---
Owner | UC-001, UC-002, UC-007, UC-008, UC-009, UC-014 | Authentication, Membership Plan Management, Analytics & Dashboard, Staff Management, Equipment Management
Manager | UC-003, UC-004, UC-005, UC-006, UC-010, UC-013, UC-027 | Class Management, Booking Management, Attendance Management, Equipment Management, Feedback Management
Trainer | UC-011, UC-012, UC-015, UC-018, UC-028, UC-029 | Personal Training / Session Management, Workout Plan Management, Staff Management
Customer | UC-016, UC-017, UC-019, UC-020, UC-021, UC-022, UC-027, UC-028, UC-029 | Booking Management, Personal Training / Session Management, Membership Plan Management, Payment Management, Feedback Management, Member Management
Guest | UC-023, UC-024, UC-025 | Authentication
System | UC-026 | System Health

---

## Danh sách Use Case
Nhóm theo Module.

### UC-001 - Quản lý gói thành viên
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-001
Tên Use Case | Quản lý gói thành viên
Module | Membership Plan Management
Actor chính | Owner
Actor phụ | Manager
Mục tiêu | Tạo, cập nhật và hủy gói thành viên để phục vụ khách hàng.

#### Tiền điều kiện
- Owner đăng nhập thành công.
- Có quyền truy cập trang quản lý membership plans.

#### Hậu điều kiện
- Gói thành viên được tạo/cập nhật/xóa trong bảng membership_plans.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Owner | Truy cập trang Owner Memberships. |
| 2 | Owner | Xem danh sách membership plans. |
| 3 | Owner | Chọn tạo gói mới, nhập tên, giá, đặc điểm, thời hạn. |
| 4 | Owner | Gửi form, hệ thống thực hiện. |
| 5 | Hệ thống | lưu vào `membership_plans` và trả về gói mới. |
| 6 | Owner | có thể sửa hoặc xóa gói bằng hoặc. |

#### Luồng thay thế

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Owner | muốn chỉnh sửa gói Tải form edit, thực hiện. |
| 2 | Owner | muốn chuyển trạng thái thành inactive Sửa trường `is Active` qua. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Dữ liệu không hợp lệ. Zod trả về lỗi 400. |
| 2 | Hệ thống | Gói không tồn tại 404. |

#### Quy tắc nghiệp vụ
- `priceMonthly` phải là số không âm.
- `durationMonths` tối thiểu 1 tháng.
- `isActive` quyết định có hiển thị plan cho khách hàng hay không.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `membership_plans`
DTO | `CreateMembershipBody`, `UpdateMembershipBody`, `ListMembershipsResponse`
Model | `membershipPlansTable`
Database Table | `membership_plans`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/memberships`, POST `/api/memberships`, PATCH `/api/memberships/:id`, DELETE `/api/memberships/:id`
Route | `artifacts/api-server/src/routes/memberships.ts`
Controller | `memberships.ts`
Service | Drizzle ORM trực tiếp qua `@workspace/db` trong route handler.

---

### UC-002 - Xem dashboard phân tích tổng quan
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-002
Tên Use Case | Xem dashboard phân tích tổng quan
Module | Analytics & Dashboard
Actor chính | Owner
Actor phụ | Manager
Mục tiêu | Cung cấp số liệu thành viên, doanh thu, lớp học và retention.

#### Tiền điều kiện
- Owner/Manager đăng nhập.
- Có quyền truy cập trang analytics của owner.

#### Hậu điều kiện
- Hiển thị số liệu thống kê tổng quan.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Owner | truy cập trang Owner Analytics. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Hệ thống | tập hợp số lượng thành viên, staff, classes, sessions và doanh thu. |
| 4 | Hệ thống | hiển thị thống kê. |

#### Luồng thay thế

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Chuyển sang thống kê doanh thu . |
| 2 | Hệ thống | Chuyển sang thống kê lớp phổ biến . |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | API trả lỗi 500. Hiển thị thông báo lỗi tải báo cáo. |

#### Quy tắc nghiệp vụ
- Doanh thu tính từ `membership_plans` của thành viên đang active.
- Retention tính theo thành viên active/expired/cancelled.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `members`, `membership_plans`, `staff`, `classes`, `bookings`, `pt_sessions`, `workout_plans`
DTO | `GetDashboardStatsResponse`, `GetRevenueStatsResponse`, `GetClassPopularityResponse`, `GetTrainerPerformanceResponse`, `GetMemberRetentionResponse`
Database Tables | `members`, `membership_plans`, `staff`, `classes`, `bookings`, `pt_sessions`, `workout_plans`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/analytics/dashboard`, `/api/analytics/revenue`, `/api/analytics/class-popularity`, `/api/analytics/trainer-performance`, `/api/analytics/member-retention`
Route | `artifacts/api-server/src/routes/analytics.ts`
Controller | `analytics.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-003 - Quản lý lớp học
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-003
Tên Use Case | Quản lý lớp học
Module | Class Management
Actor chính | Manager
Actor phụ | Owner
Mục tiêu | Tạo và duy trì lịch lớp học, gán huấn luyện viên, theo dõi sức chứa.

#### Tiền điều kiện
- Manager đăng nhập.
- Truy cập trang ManagerClasses.

#### Hậu điều kiện
- Lớp học mới được lưu vào bảng `classes`.
- Thông tin lớp học có thể cập nhật và xóa.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Manager | truy cập trang Manager Classes. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Manager | mở dialog tạo lớp mới. |
| 4 | Manager | nhập tên, trainer Id, lịch, số lượng, danh mục. |
| 5 | Hệ thống | Gửi |
| 6 | Hệ thống | lưu `classes`, trả về dữ liệu lớp. |

#### Luồng thay thế

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Manager | sửa lớp. |
| 2 | Manager | xoá lớp. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Dữ liệu không hợp lệ. Zod trả về 400. |
| 2 | Hệ thống | Lớp không tồn tại 404. |

#### Quy tắc nghiệp vụ
- `capacity` mặc định 20.
- `scheduledAt` phải có giá trị hợp lệ.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `classes`, `staff`
DTO | `ListClassesResponse`, `CreateClassBody`, `UpdateClassBody`
Database Table | `classes`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/classes`, POST `/api/classes`, GET `/api/classes/:id`, PATCH `/api/classes/:id`, DELETE `/api/classes/:id`
Route | `artifacts/api-server/src/routes/classes.ts`
Controller | `classes.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-004 - Xem và quản lý danh sách thành viên
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-004
Tên Use Case | Xem và quản lý thành viên
Module | Member Management
Actor chính | Manager
Actor phụ | Owner
Mục tiêu | Xem, tạo, cập nhật và xóa hồ sơ thành viên.

#### Tiền điều kiện
- Manager/Owner đăng nhập.
- Truy cập trang ManagerMembers hoặc OwnerMembers.

#### Hậu điều kiện
- Thành viên được tạo/cập nhật/xóa trong bảng `members`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Manager | /Owner mở trang members. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Hệ thống | Danh sách thành viên hiển thị. |
| 4 | Người dùng | có thể tạo thành viên mới. |
| 5 | Khách hàng | sửa thông tin. |
| 6 | Hệ thống | Xóa thành viên |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Email trùng lặp hoặc dữ liệu thiếu . Zod trả 400. |
| 2 | Hệ thống | Không tìm thấy member 404. |

#### Quy tắc nghiệp vụ
- Mỗi member có `membershipPlanId` (có thể null).
- `status` chấp nhận giá trị như active/expired/cancelled.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `members`, `membership_plans`
DTO | `ListMembersResponse`, `CreateMemberBody`, `UpdateMemberBody`, `GetMemberResponse`
Database Table | `members`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/members`, POST `/api/members`, GET `/api/members/:id`, PATCH `/api/members/:id`, DELETE `/api/members/:i`, GET `/api/members/:id/training-history`
Route | `artifacts/api-server/src/routes/members.ts`
Controller | `members.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-005 - Quản lý attendance
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-005
Tên Use Case | Quản lý attendance
Module | Attendance Management
Actor chính | Manager
Actor phụ | Trainer
Mục tiêu | Ghi lại điểm danh thành viên khi tham gia lớp hoặc vào phòng gym.

#### Tiền điều kiện
- Manager đăng nhập.
- Truy cập trang ManagerAttendance.

#### Hậu điều kiện
- Bản ghi attendance được thêm vào `attendance`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Manager | truy cập Manager Attendance. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Manager | ghi attendance mới qua. |
| 4 | Hệ thống | lưu `attendance` với `checked In At`. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Dữ liệu không hợp lệ. Zod trả 400. |

#### Quy tắc nghiệp vụ
- `memberId` bắt buộc.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `attendance`, `members`, `classes`
DTO | `ListAttendanceResponse`, `CreateAttendanceBody`
Database Table | `attendance`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/attendance`, POST `/api/attendance`
Route | `artifacts/api-server/src/routes/attendance.ts`
Controller | `attendance.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-006 - Quản lý thiết bị
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-006
Tên Use Case | Quản lý thiết bị
Module | Equipment Management
Actor chính | Manager
Actor phụ | Owner
Mục tiêu | Theo dõi, tạo, cập nhật và xóa thiết bị.

#### Tiền điều kiện
- Manager/Owner đăng nhập.
- Truy cập trang Equipment.

#### Hậu điều kiện
- Thiết bị được lưu/cập nhật/xóa trong bảng `equipment`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Manager | /Owner thực hiện. |
| 2 | Hệ thống | Xem danh sách thiết bị. |
| 3 | Hệ thống | Tạo thiết bị mới |
| 4 | Hệ thống | Lấy chi tiết |
| 5 | Hệ thống | Cập nhật |
| 6 | Hệ thống | Xóa |

#### Quy tắc nghiệp vụ
- `condition` và `status` mặc định.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `equipment`
DTO | `CreateEquipmentBody`, `UpdateEquipmentBody`
Database Table | `equipment`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/equipment`, POST `/api/equipment`, GET `/api/equipment/:id`, PATCH `/api/equipment/:id`, DELETE `/api/equipment/:id`
Route | `artifacts/api-server/src/routes/equipment.ts`
Controller | `equipment.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-007 - Quản lý nhân sự
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-007
Tên Use Case | Quản lý nhân sự
Module | Staff Management
Actor chính | Owner
Actor phụ | Manager
Mục tiêu | Quản lý thông tin nhân sự và huấn luyện viên.

#### Tiền điều kiện
- Owner/Manager đăng nhập.
- Truy cập trang OwnerStaff hoặc ManagerStaff.

#### Hậu điều kiện
- Nhân sự được tạo, cập nhật hoặc xóa trong `staff`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Owner/Manager |
| 2 | Hệ thống | Hiển thị danh sách nhân sự. |
| 3 | Hệ thống | Tạo nhân sự |
| 4 | Hệ thống | Sửa thông tin |
| 5 | Hệ thống | Xóa nhân sự |

#### Quy tắc nghiệp vụ
- `role` không được bỏ trống.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `staff`
DTO | `ListStaffResponse`, `CreateStaffBody`, `GetStaffResponse`, `UpdateStaffBody`
Database Table | `staff`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/staff`, POST `/api/staff`, GET `/api/staff/:id`, PATCH `/api/staff/:id`, DELETE `/api/staff/:id`
Route | `artifacts/api-server/src/routes/staff.ts`
Controller | `staff.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-008 - Quản lý người dùng hệ thống và xác thực
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-008
Tên Use Case | Quản lý người dùng hệ thống và xác thực
Module | Authentication
Actor chính | Owner
Actor phụ | Manager
Mục tiêu | Quản lý user login và đặt lại mật khẩu hệ thống.

#### Tiền điều kiện
- Owner/Manager truy cập trang admin user.

#### Hậu điều kiện
- User được tạo trong bảng `users`.
- Thông tin đăng nhập được xác thực.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Admin | thực hiện. |
| 2 | Hệ thống | Xem danh sách tài khoản. |
| 3 | Hệ thống | Tạo tài khoản mới |
| 4 | Người dùng | đăng nhập. |
| 5 | Người dùng | đổi mật khẩu. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Sai username/password trả 401. |
| 2 | Hệ thống | User không tồn tại trả 404. |

#### Quy tắc nghiệp vụ
- Mật khẩu mã hóa SHA-256.
- Token trả về base64 từ userId và role.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `users`
DTO | `CreateUserBody`, `LoginBody`, `ResetPasswordBody`
Database Table | `users`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/auth/users`, POST `/api/auth/users`, POST `/api/auth/login`, POST `/api/auth/reset-password`
Route | `artifacts/api-server/src/routes/auth.ts`
Controller | `auth.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-009 - Kiểm tra trạng thái hệ thống
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-009
Tên Use Case | Kiểm tra trạng thái hệ thống
Module | System Health
Actor chính | System
Actor phụ | Không
Mục tiêu | Xác nhận backend API đang hoạt động.

#### Tiền điều kiện
- Yêu cầu được gửi tới endpoint `/api/healthz`.

#### Hậu điều kiện
- Hệ thống trả về trạng thái sống.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | hoặc công cụ giám sát thực hiện. |
| 2 | Hệ thống | trả `{ status: 'ok' }`. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | Không
DTO | `HealthCheckResponse`
Database Table | Không

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/healthz`
Route | `artifacts/api-server/src/routes/health.ts`
Controller | `health.ts`
Service | Không có; chỉ trả dữ liệu tĩnh.

---

### UC-010 - Quản lý phản hồi khách hàng
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-010
Tên Use Case | Quản lý phản hồi khách hàng
Module | Feedback Management
Actor chính | Manager
Actor phụ | Owner
Mục tiêu | Xem và quản lý phản hồi từ khách hàng.

#### Tiền điều kiện
- Manager/Owner đăng nhập.
- Truy cập trang ManagerFeedback hoặc OwnerFeedback.

#### Hậu điều kiện
- Feedback được lưu vào `feedback`.
- Manager có thể xóa phản hồi.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Manager | thực hiện. |
| 2 | Hệ thống | Xem danh sách phản hồi từ thành viên. |
| 3 | Hệ thống | Nếu cần, xóa phản hồi |

#### Luồng thay thế

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Khách hàng | gửi phản hồi qua form Customer Feedback. |
| 2 | Hệ thống | thực hiện . |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `feedback`, `members`
DTO | `CreateFeedbackBody`, `ListFeedbackResponse`
Database Table | `feedback`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/feedback`, POST `/api/feedback`, DELETE `/api/feedback/:id`
Route | `artifacts/api-server/src/routes/feedback.ts`
Controller | `feedback.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-011 - Quản lý buổi tập PT
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-011
Tên Use Case | Quản lý buổi tập PT
Module | Personal Training / Session Management
Actor chính | Trainer
Actor phụ | Customer
Mục tiêu | Tạo lịch buổi tập, cập nhật trạng thái và ghi chú buổi tập.

#### Tiền điều kiện
- Trainer đăng nhập.
- Có danh sách khách hàng PT.

#### Hậu điều kiện
- Buổi tập PT được thêm/đánh dấu hoàn thành trong `pt_sessions`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Trainer | truy cập trang Trainer Sessions. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Trainer | tạo buổi tập mới. |
| 4 | Trainer | đánh dấu buổi tập là completed. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Lỗi validation trả 400. |
| 2 | Hệ thống | Session không tồn tại trả 404. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `pt_sessions`, `staff`, `members`
DTO | `ListSessionsResponse`, `CreateSessionBody`, `UpdateSessionBody`, `GetSessionResponse`
Database Table | `pt_sessions`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/sessions`, POST `/api/sessions`, GET `/api/sessions/:id`, PATCH `/api/sessions/:id`, DELETE `/api/sessions/:id`
Route | `artifacts/api-server/src/routes/sessions.ts`
Controller | `sessions.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-012 - Quản lý kế hoạch workout
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-012
Tên Use Case | Quản lý kế hoạch workout
Module | Workout Plan Management
Actor chính | Trainer
Actor phụ | Customer
Mục tiêu | Tạo, xem và cập nhật kế hoạch tập luyện cá nhân.

#### Tiền điều kiện
- Trainer hoặc khách hàng đăng nhập.

#### Hậu điều kiện
- Workout plan được lưu trong `workout_plans`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Trainer | /Customer thực hiện. |
| 2 | Hệ thống | Tạo kế hoạch mới |
| 3 | Hệ thống | Xem chi tiết |
| 4 | Hệ thống | Cập nhật |
| 5 | Hệ thống | Xóa |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `workout_plans`, `staff`, `members`
DTO | `ListWorkoutsResponse`, `CreateWorkoutBody`, `UpdateWorkoutBody`, `GetWorkoutResponse`
Database Table | `workout_plans`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/workouts`, POST `/api/workouts`, GET `/api/workouts/:id`, PATCH `/api/workouts/:id`, DELETE `/api/workouts/:id`
Route | `artifacts/api-server/src/routes/workouts.ts`
Controller | `workouts.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-013 - Duyệt và theo dõi yêu cầu PT
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-013
Tên Use Case | Duyệt và theo dõi yêu cầu PT
Module | Personal Training / Session Management
Actor chính | Trainer
Actor phụ | Manager
Mục tiêu | Theo dõi và cập nhật trạng thái yêu cầu PT từ khách hàng.

#### Tiền điều kiện
- Trainer/Manager đăng nhập.
- Khách hàng đã gửi PT request.

#### Hậu điều kiện
- Yêu cầu PT được lưu hoặc cập nhật trong `pt_requests`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Trainer/Manager |
| 2 | Hệ thống | Xem danh sách |
| 3 | Hệ thống | Cập nhật trạng thái |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `pt_requests`, `members`, `staff`
DTO | `CreatePTRequestBody`, `UpdatePTRequestBody`
Database Table | `pt_requests`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/pt-requests`, POST `/api/pt-requests`, PATCH `/api/pt-requests/:id`
Route | `artifacts/api-server/src/routes/ptRequests.ts`
Controller | `ptRequests.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-014 - Quản lý lịch trình thanh toán và thành viên
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-014
Tên Use Case | Quản lý lịch trình thanh toán và thành viên
Module | Payment Management
Actor chính | Owner
Actor phụ | Customer
Mục tiêu | Ghi nhận và xem các giao dịch thanh toán của thành viên.

#### Tiền điều kiện
- Người dùng đăng nhập.
- Có thành viên và gói thành viên.

#### Hậu điều kiện
- Thanh toán được lưu trong `payments`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | hoặc admin xem giao dịch bằng. |
| 2 | Hệ thống | Khi thanh toán, thực hiện |
| 3 | Hệ thống | Nếu cần cập nhật trạng thái dùng |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `payments`, `members`, `membership_plans`
DTO | `CreatePaymentBody`, `UpdatePaymentBody`
Database Table | `payments`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
API | GET `/api/payments`, POST `/api/payments`, PATCH `/api/payments/:id`
Route | `artifacts/api-server/src/routes/payments.ts`
Controller | `payments.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-015 - Xem và cập nhật profile huấn luyện viên
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-015
Tên Use Case | Xem và cập nhật profile huấn luyện viên
Module | Staff Management
Actor chính | Trainer
Actor phụ | Owner
Mục tiêu | Cho phép trainer xem và cập nhật thông tin cá nhân.

#### Tiền điều kiện
- Trainer đăng nhập.
- Có staffId trong session.

#### Hậu điều kiện
- Thông tin trainer cập nhật trong bảng `staff`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Trainer | mở trang Trainer Profile. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Trainer | cập nhật thông tin qua. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `staff`
API | GET `/api/staff/:id`, PATCH `/api/staff/:id`
Route | `artifacts/api-server/src/routes/staff.ts`
Authentication | `users.staffId` liên kết tới staff record.

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Controller | `staff.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-016 - Đăng ký lớp học cho khách hàng
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-016
Tên Use Case | Đăng ký lớp học
Module | Booking Management
Actor chính | Customer
Actor phụ | Manager
Mục tiêu | Cho phép khách hàng đăng ký tham gia lớp học.

#### Tiền điều kiện
- Customer đã đăng nhập.
- Có `memberId` trong localStorage.

#### Hậu điều kiện
- Booking mới lưu vào bảng `bookings`.
- `classes.enrolledCount` tăng lên.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | mở trang Customer Classes. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Customer | chọn lớp chưa đầy. |
| 4 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 5 | Hệ thống | xác nhận và tăng `enrolled |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Lớp đầy trả 400 và thông báo. |
| 2 | Hệ thống | Class không tồn tại trả 404. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `bookings`, `classes`, `members`
API | GET `/api/bookings`, POST `/api/bookings`, PATCH `/api/bookings/:id`, DELETE `/api/bookings/:id`
Route | `artifacts/api-server/src/routes/bookings.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Controller | `bookings.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-017 - Hủy đặt chỗ lớp học
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-017
Tên Use Case | Hủy đặt chỗ lớp học
Module | Booking Management
Actor chính | Customer
Actor phụ | Manager
Mục tiêu | Cho phép khách hàng hủy booking lớp học.

#### Tiền điều kiện
- Customer đăng nhập.
- Booking tồn tại.

#### Hậu điều kiện
- Booking bị xóa hoặc chuyển trạng thái.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | xem trang Customer Bookings. |
| 2 | Customer | chọn booking cần hủy. |
| 3 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 4 | Hệ thống | xóa booking. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `bookings`
API | DELETE `/api/bookings/:id`
Controller | `bookings.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-027 - Cập nhật đặt chỗ lớp học
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-027
Tên Use Case | Cập nhật đặt chỗ lớp học
Module | Booking Management
Actor chính | Manager
Actor phụ | Customer
Mục tiêu | Cho phép điều chỉnh booking, cập nhật trạng thái hoặc thông tin đặt chỗ.

#### Tiền điều kiện
- Manager hoặc Customer đã đăng nhập.
- Booking tồn tại trong hệ thống.

#### Hậu điều kiện
- Thông tin booking được cập nhật trong bảng `bookings`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Manager/Customer |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Hệ thống | Chọn booking cần chỉnh sửa. |
| 4 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 5 | Hệ thống | xác thực dữ liệu và cập nhật bản ghi trong `bookings`. |
| 6 | Hệ thống | trả về booking đã cập nhật. |

#### Luồng thay thế

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Muốn hủy booking Customer hoặc Manager thực hiện . |
| 2 | Hệ thống | Muốn xem chi tiết booking Customer thực hiện . |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Dữ liệu không hợp lệ. Zod trả về lỗi 400. |
| 2 | Hệ thống | Booking không tồn tại 404. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `bookings`, `members`, `classes`
API | GET `/api/bookings`, PATCH `/api/bookings/:id`, DELETE `/api/bookings/:id`
Route | `artifacts/api-server/src/routes/bookings.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Controller | `bookings.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-028 - Xem lịch sử tập luyện thành viên
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-028
Tên Use Case | Xem lịch sử tập luyện thành viên
Module | Member Management
Actor chính | Customer
Actor phụ | Trainer
Mục tiêu | Cho phép thành viên hoặc trainer xem lịch sử buổi tập PT và lớp đã tham gia.

#### Tiền điều kiện
- Customer hoặc Trainer đã đăng nhập.
- Member tồn tại.

#### Hậu điều kiện
- Trả về danh sách session PT và booking lớp học liên quan đến member.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Customer/Trainer |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Hệ thống | lấy dữ liệu từ `pt_sessions` và `bookings`, ghép thông tin trainer/class. |
| 4 | Hệ thống | trả về danh sách lịch sử sắp xếp theo thời gian. |
| 5 | Hệ thống | hiển thị lịch sử buổi tập và lớp học. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Member không tồn tại 404. |
| 2 | Hệ thống | Lỗi truy vấn dữ liệu 500. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `members`, `pt_sessions`, `bookings`, `classes`, `staff`
API | GET `/api/members/:id/training-history`
Route | `artifacts/api-server/src/routes/members.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Controller | `members.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-029 - Quản lý chi tiết buổi tập PT
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-029
Tên Use Case | Quản lý chi tiết buổi tập PT
Module | Personal Training / Session Management
Actor chính | Trainer
Actor phụ | Customer
Mục tiêu | Cho phép trainer xem, cập nhật hoặc xóa buổi PT cụ thể.

#### Tiền điều kiện
- Trainer đăng nhập.
- Session tồn tại.

#### Hậu điều kiện
- Session PT được trả về, cập nhật hoặc xóa khỏi bảng `pt_sessions`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Trainer | mở trang chi tiết buổi tập PT. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Trainer | xem thông tin session. |
| 4 | Trainer | cập nhật session bằng. |
| 5 | Hệ thống | lưu session cập nhật và trả về dữ liệu mới. |
| 6 | Hệ thống | Nếu cần, |

#### Luồng thay thế

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Trainer | chỉ xem session Chỉ thực hiện. |
| 2 | Trainer | xóa session Chỉ thực hiện. |

#### Luồng ngoại lệ

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Hệ thống | Session không tồn tại 404. |
| 2 | Hệ thống | Dữ liệu cập nhật không hợp lệ400. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `pt_sessions`, `members`, `staff`
API | GET `/api/sessions/:id`, PATCH `/api/sessions/:id`, DELETE `/api/sessions/:id`
Route | `artifacts/api-server/src/routes/sessions.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Controller | `sessions.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-018 - Xem danh sách khách hàng PT
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-018
Tên Use Case | Xem danh sách khách hàng PT
Module | Personal Training / Session Management
Actor chính | Trainer
Actor phụ | Customer
Mục tiêu | Cho trainer xem khách hàng đã ký PT và tạo lịch.

#### Tiền điều kiện
- Trainer đăng nhập.
- Có yêu cầu PT đang ở trạng thái confirm/approved.

#### Hậu điều kiện
- Trainer thấy danh sách khách hàng hợp lệ.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Trainer | mở trang Trainer Sessions. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Hệ thống | Hiển thị danh sách khách. |
| 4 | Trainer | tạo buổi tập cho khách bằng. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `pt_requests`, `pt_sessions`, `members`, `staff`
API | GET `/api/pt-requests`, POST `/api/sessions`
Controller | `ptRequests.ts`, `sessions.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-019 - Cập nhật profile khách hàng
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-019
Tên Use Case | Cập nhật profile khách hàng
Module | Member Management
Actor chính | Customer
Actor phụ | Không
Mục tiêu | Cho phép khách hàng sửa profile cá nhân.

#### Tiền điều kiện
- Customer đăng nhập.
- Có `memberId` liên kết user.

#### Hậu điều kiện
- Thông tin thành viên trong `members` được cập nhật.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | mở trang Customer Profile. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Customer | sửa thông tin và gửi. |
| 4 | Hệ thống | lưu dữ liệu mới. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `members`
API | GET `/api/members/:id`, PATCH `/api/members/:id`
Controller | `members.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-020 - Thuê huấn luyện viên cá nhân
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-020
Tên Use Case | Thuê huấn luyện viên cá nhân
Module | Personal Training / Session Management
Actor chính | Customer
Actor phụ | Trainer
Mục tiêu | Cho phép khách hàng gửi yêu cầu PT và ghi nhận thanh toán.

#### Tiền điều kiện
- Customer đăng nhập.
- Có danh sách trainer tersedia.

#### Hậu điều kiện
- Yêu cầu PT lưu vào `pt_requests`.
- Thanh toán lưu vào `payments`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | mở trang Customer Hire PT. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Customer | chọn trainer, nhập lịch, số buổi, thông tin. |
| 4 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 5 | Hệ thống | lưu |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `pt_requests`, `payments`, `members`, `staff`
API | GET `/api/staff`, POST `/api/payments`, POST `/api/pt-requests`
Controller | `ptRequests.ts`, `payments.ts`, `staff.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-021 - Thanh toán gói thành viên
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-021
Tên Use Case | Thanh toán gói thành viên
Module | Payment Management
Actor chính | Customer
Actor phụ | Owner
Mục tiêu | Ghi nhận và theo dõi thanh toán của thành viên.

#### Tiền điều kiện
- Customer đã chọn gói membership.

#### Hậu điều kiện
- Bản ghi thanh toán tạo trong `payments`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | mở trang Customer Membership hoặc Customer Payments. |
| 2 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 3 | Customer | thực hiện thanh toán, thực hiện. |
| 4 | Hệ thống | lưu thông tin thanh toán. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `payments`, `membership_plans`, `members`
API | GET `/api/memberships`, POST `/api/payments`, GET `/api/payments`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Controller | `payments.ts`, `memberships.ts`
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-022 - Gửi phản hồi của khách hàng
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-022
Tên Use Case | Gửi phản hồi của khách hàng
Module | Feedback Management
Actor chính | Customer
Actor phụ | Manager
Mục tiêu | Cho phép khách hàng gửi nhận xét về dịch vụ.

#### Tiền điều kiện
- Customer đăng nhập.
- Truy cập trang CustomerFeedback.

#### Hậu điều kiện
- Feedback được lưu vào bảng `feedback`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Customer | mở Customer Feedback. |
| 2 | Hệ thống | Nhập rating và comment. |
| 3 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 4 | Hệ thống | lưu phản hồi. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `feedback`, `members`
API | POST `/api/feedback`
Controller | `feedback.ts`

#### Thành phần liên quan
Thành phần | Liên quan
--- | ---
Service | Drizzle ORM trực tiếp trong route handler.

---

### UC-023 - Đăng nhập hệ thống
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-023
Tên Use Case | Đăng nhập hệ thống
Module | Authentication
Actor chính | Guest
Actor phụ | Không
Mục tiêu | Xác thực người dùng và lưu thông tin session.

#### Tiền điều kiện
- Người dùng truy cập landing page.

#### Hậu điều kiện
- Backend trả token base64.
- LocalStorage lưu role, userId, memberId/staffId.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Guest | mở trang Landing. |
| 2 | Hệ thống | Nhập username và password. |
| 3 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 4 | Hệ thống | xác thực và trả dữ liệu user. |
| 5 | Hệ thống | lưu thông tin vào local |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `users`
API | POST `/api/auth/login`
Controller | `auth.ts`

---

### UC-024 - Tạo user hệ thống
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-024
Tên Use Case | Tạo user hệ thống
Module | Authentication
Actor chính | Owner
Actor phụ | Manager
Mục tiêu | Tạo tài khoản nội bộ cho nhân sự hoặc thành viên.

#### Tiền điều kiện
- Owner/Manager đăng nhập.

#### Hậu điều kiện
- Tài khoản mới lưu vào bảng `users`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Admin | truy cập form tạo user. |
| 2 | Hệ thống | Nhập username, password, full |
| 3 | Hệ thống | Thực hiện hành vi nghiệp vụ. |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `users`
API | POST `/api/auth/users`
Controller | `auth.ts`

---

### UC-025 - Đặt lại mật khẩu
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-025
Tên Use Case | Đặt lại mật khẩu
Module | Authentication
Actor chính | Guest
Actor phụ | Customer
Mục tiêu | Cho phép người dùng đặt lại mật khẩu khi quên.

#### Tiền điều kiện
- Có username hợp lệ.

#### Hậu điều kiện
- Mật khẩu mới cập nhật vào `users`.

#### Luồng chính

| STT | Thực hiện bởi | Hành động |
| --- | --- | --- |
| 1 | Người dùng | truy cập landing/forgot password. |
| 2 | Hệ thống | Nhập username và mật khẩu mới. |
| 3 | Hệ thống | Thực hiện hành vi nghiệp vụ. |
| 4 | Hệ thống | cập nhật password |

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
Entity | `users`
API | POST `/api/auth/reset-password`
Controller | `auth.ts`

---

### UC-026 - Kiểm tra sức khỏe API
#### Thông tin chung
Thuộc tính | Giá trị
--- | ---
Mã Use Case | UC-026
Tên Use Case | Kiểm tra sức khỏe API
Module | System Health
Actor chính | System
Actor phụ | Không
Mục tiêu | Xác thực backend đang online.

#### Tiền điều kiện
- Yêu cầu GET gửi tới `/api/healthz`.

#### Hậu điều kiện
- Server trả status `ok`.

#### Dữ liệu liên quan
Loại | Giá trị
--- | ---
API | GET `/api/healthz`
Controller | `health.ts`

---

## Chức năng theo Actor

### Owner
Các Use Case:
- UC-001
- UC-002
- UC-007
- UC-008
- UC-014
- UC-009

### Manager
Các Use Case:
- UC-003
- UC-004
- UC-005
- UC-006
- UC-010
- UC-013
- UC-027

### Trainer
Các Use Case:
- UC-011
- UC-012
- UC-015
- UC-018
- UC-013
- UC-028
- UC-029

### Customer
Các Use Case:
- UC-016
- UC-017
- UC-019
- UC-020
- UC-021
- UC-022
- UC-025
- UC-027
- UC-028
- UC-029
- UC-027
- UC-028

### Guest
Các Use Case:
- UC-023
- UC-024
- UC-025

### System
Các Use Case:
- UC-009
- UC-026

---

## Chức năng theo Module

### Authentication
Các Use Case:
- UC-008
- UC-023
- UC-024
- UC-025

### Member Management
Các Use Case:
- UC-004
- UC-019
- UC-028

### Staff Management
Các Use Case:
- UC-007
- UC-015

### Class Management
Các Use Case:
- UC-003

### Booking Management
Các Use Case:
- UC-016
- UC-017
- UC-027

### Personal Training / Session Management
Các Use Case:
- UC-011
- UC-013
- UC-018
- UC-020
- UC-029

### Workout Plan Management
Các Use Case:
- UC-012

### Attendance Management
Các Use Case:
- UC-005

### Membership Plan Management
Các Use Case:
- UC-001
- UC-021

### Equipment Management
Các Use Case:
- UC-006

### Payment Management
Các Use Case:
- UC-014
- UC-021

### Feedback Management
Các Use Case:
- UC-010
- UC-022

### Analytics & Dashboard
Các Use Case:
- UC-002

### System Health
Các Use Case:
- UC-009
- UC-026

---

## Luồng nghiệp vụ tổng thể

1. Guest truy cập trang landing và đăng nhập/đăng ký.
2. Sau khi xác thực, hệ thống phân quyền theo role: owner, manager, trainer, customer.
3. Owner và manager quản lý membership plans, staff, equipment, và dữ liệu kinh doanh.
4. Customer duyệt gói membership, đăng ký lớp học, thuê PT, thực hiện thanh toán và gửi feedback.
5. Trainer nhận yêu cầu PT, tạo lịch PT, quản lý buổi tập, và thiết kế workout plan.
6. Manager điều phối class, điểm danh attendance, theo dõi thiết bị và phản hồi.
7. Owner xem dashboard analytics tổng quan để đánh giá doanh thu và hiệu suất.
8. Backend phục vụ dữ liệu qua `/api` route, sử dụng Drizzle ORM trực tiếp trong các route handler.

---

## Coverage Analysis
- Tổng số Actor: 6
- Tổng số Module: 14
- Tổng số Use Case: 29
- Module chưa có Use Case: không có module chính nào không có use case.
- Endpoint chưa được ánh xạ Use Case: không có.
- Entity chưa được ánh xạ nghiệp vụ:
  - Không có entity chính nào bị bỏ sót; tất cả entities trong `lib/db/src/schema` đều liên quan vào use case.
- Chức năng nội bộ chưa gắn Actor:
  - Không xác định chức năng nội bộ riêng nào chưa gắn actor; mọi tính năng người dùng đã được ánh xạ.