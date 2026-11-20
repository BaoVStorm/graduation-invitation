# Việc cần làm để hoàn thiện

> Cập nhật 20/11/2026. Lễ tốt nghiệp: **Thứ Sáu 27/11/2026, 10:00–12:00**. Đánh dấu `[x]` khi xong.

## Ảnh kỷ niệm (gửi sau)

- [ ] **Lâm Wibu** (`/top1wibuvn`): bỏ ảnh vào `memories-src/top1wibuvn/` → `npm run memories` → commit + push
- [ ] **Gia đình** (`/giadinh`): bỏ ảnh vào `memories-src/giadinh/` → `npm run memories` → commit + push

> Đặt tên file kiểu `01 - Chú thích.jpg` để có sẵn chú thích. Thư mục đã được tạo sẵn, ảnh gốc không bị commit.

## Lời nhắn còn thiếu

- [ ] **Phát Huỳnh** (`/anh_mentor_ba_bros`): đang dùng lời nhắn mặc định, chờ nội dung
- [ ] **Nguyễn Minh Nhựt** (`/anhnhutnguyen`): đang dùng lời nhắn mặc định, chờ nội dung
- [ ] *(Tuỳ chọn)* Những khách đang dùng lời nhắn mặc định: Thuý Nguyễn, Đặng Linh, Lê Tiến Đạt, Vũ Nguyễn Duy Linh, Nguyên Phúc, Duy Tân, Thành Quý, Thiện Võ.
  Lời mặc định là *"Cảm ơn bạn vì đã là một phần trong hành trình của mình."*

## Cần xác nhận

- [ ] **"Tiến Dỗ"** đang được ghi là **Tiến Đỗ** (nghi gõ nhầm). Nếu đúng là "Dỗ" thì sửa lại.
- [ ] **"nguyên phúc"** đang được ghi là **Nguyên Phúc**. Nếu là họ Nguyễn thì sửa thành "Nguyễn Phúc".
- [ ] **"Ngọc Thịnh - zont"** hiển thị là **Bạn Ngọc Thịnh**, chữ "Zont" chỉ nằm trong lời nhắn. Có muốn hiện "Ngọc Thịnh (Zont)" không?
- [ ] **Nguyên Phúc, Thành Quý, Thiện Võ** chưa ghi cách tự xưng nên đang để "mình".
- [ ] **Thư gia đình** (`/giadinh`): đây là thư mình tự viết (xưng "con", gọi "cả nhà"). Đọc lại và sửa trong `data/guests.json` (trường `message` và `letter`).
- [ ] Duyệt lại các lời nhắn đã được viết lại cho gọn (trường `message` trong `data/guests.json`).

## Kỹ thuật

- [ ] **Kích hoạt form lời chúc:** gửi thử một lời chúc → mở email *FormSubmit – Activate Form* → bấm Activate
- [ ] *(Khuyên dùng)* Sau khi kích hoạt: đổi `SECRET_WISH_EMAIL` sang chuỗi ngẫu nhiên FormSubmit cấp để giấu email (xem [SECRETS.md](SECRETS.md))
- [ ] Mở thử vài link trên **điện thoại thật** (iPhone + Android): độ mượt cảnh bay, âm thanh, nghiêng máy
- [ ] Dán thử 1 link vào Zalo/Messenger để xem ảnh xem trước. Nếu hiện ảnh cũ thì dùng Facebook Sharing Debugger.

## Đã xong gần đây

- [x] Thêm 21 khách (kể cả thư gia đình), lời nhắn đã viết lại cho gọn
- [x] Xoá khách thử `thanhvinh`, `ngocthinh` và 4 ảnh mẫu
- [x] Path cho phép dấu `_` (ví dụ `anh_mentor_ba_bros`)
- [x] Thư ngỏ tự co chữ khi lời nhắn dài
