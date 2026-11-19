# Context dự án — Thư mời tốt nghiệp 3D

> File này là "bộ nhớ" của dự án. Mọi quyết định, dữ liệu sự kiện và nguyên tắc thiết kế được ghi ở đây để bất kỳ ai (hoặc AI) tiếp tục làm cũng nắm đủ bối cảnh. Cập nhật file này mỗi khi có quyết định mới.

## 1. Mục tiêu

Một website thư mời tốt nghiệp **dùng chung một source code**. Mỗi khách mời có **đường dẫn riêng** (ví dụ `https://<domain>/a7k2`). Mã trong path quyết định dữ liệu hiển thị (tên, cách xưng hô, lời nhắn riêng). Giao diện, hiệu ứng và thông tin sự kiện giữ nguyên.

Tiêu chí chất lượng: **chuẩn chỉ, chuyên nghiệp, có hiệu ứng 3D đầy đủ**, mượt trên điện thoại (phần lớn khách mở link từ Zalo hoặc Messenger).

## 2. Thông tin sự kiện (nguồn sự thật)

| Trường | Giá trị |
|---|---|
| Sự kiện | Lễ Tốt Nghiệp |
| Ngày | Thứ Sáu, 27/11/2026 |
| Giờ | *Chưa có, chờ chủ nhân cung cấp* |
| Địa điểm | Trường Đại học Công nghệ Thông tin – ĐHQG TP.HCM |
| Liên hệ | *Đặt trong file cấu hình, không viết cứng vào code* |
| Ảnh chính | Ảnh chân dung mặc lễ phục (đã có bản làm sáng mặt `anh-sang.jpg`) |

> Hôm nay là 19/11/2026, tức là **còn 8 ngày** trước sự kiện. Ưu tiên bản chạy được, đẹp và ổn định trước, rồi mới đến hiệu ứng nâng cao.

## 3. Lịch sử thiết kế (đã thử)

Bản ảnh tĩnh trước đó (nằm trong thư mục `thu-moi-tot-nghiep/` ở workspace gốc, không thuộc repo này):

1. Navy + viền vàng cổ điển. **Bị chê là đơn điệu.**
2. Nền kem, ảnh vòm. **Bị chê là đơn điệu.**
3. **Bìa tạp chí "GRADUATE."** ✅ Được chọn.
4. **Vé máy bay "Graduation Air" (SV → TK)** ✅ Được chọn.
5. Trang báo "Nhật Báo Tân Khoa". Chưa chọn.

**Bài học:** chủ nhân thích phong cách **sáng tạo, có ý tưởng, kể chuyện** (concept tạp chí hoặc vé bay) hơn là khung thiệp trang trọng truyền thống. Bản web phải kế thừa 2 concept đã chọn.

## 4. Kiến trúc kỹ thuật (quyết định)

- **Stack:** Vite + React + TypeScript, React Three Fiber + drei (3D), GSAP (timeline và scroll), Motion (micro-interaction UI), Tailwind CSS.
- **Routing theo mã:** `/:code`. Mã không tồn tại thì hiện bản mời chung ("Bạn thân mến"), không báo lỗi.
- **Dữ liệu tách khỏi code:**
  - `src/config/event.json`: thông tin sự kiện và tên chủ nhân, dùng chung.
  - `data/guests.json`: danh sách khách `{ code, honorific, name, self?, message? }`.
- **Kịch bản trải nghiệm:** [UI-SCRIPT.md](UI-SCRIPT.md), 10 cảnh, là nguồn sự thật cho `src/scenes/*` và `src/three/*`.
- **Prerender từng khách lúc build:** script tạo `dist/<code>/index.html` với thẻ `<title>` và Open Graph riêng (ví dụ "Thư mời gửi Anh Minh"). Nhờ vậy link gửi qua Zalo/Messenger hiện preview đúng tên, và chạy được trên GitHub Pages mà không cần SPA fallback.
- **Hosting:** GitHub Pages qua GitHub Actions (mặc định). Vercel là phương án dự phòng.
- **Hiệu năng:** tải 3D theo kiểu lazy, có fallback 2D khi thiết bị yếu hoặc bật `prefers-reduced-motion`. Mục tiêu LCP dưới 2.5s trên 4G, bundle 3D tối đa khoảng 300KB gzip, ảnh dạng WebP/AVIF.

## 5. Quyền riêng tư (chốt lại 19/11/2026)

- Repo **public**. Chỉ **số điện thoại** là bí mật, lấy qua GitHub Secret **`SECRET_PHONE`**.
- **Tên chủ nhân** công khai, nằm ở `src/config/event.json` → `host.name` (*chưa điền, chờ chủ nhân cung cấp*).
- **Danh sách khách** là "DB trong source": `data/guests.json` (commit). Mỗi khách một path dễ đọc (ví dụ `thanhvinh`, `ngocthinh`). Chủ nhân tự điền bằng script chạy ở máy `npm run guests` (menu thêm, sửa, xoá, xem). Mẫu thử hiện có: thanhvinh, ngocthinh.
- Số điện thoại chỉ được nhúng vào HTML của trang khách. Trang chung, trang 404 và bundle JS đều không có.
- Chi tiết: [SECRETS.md](SECRETS.md). Khi có dữ liệu nào chủ nhân muốn giấu, thêm secret mới theo cùng cơ chế.

## 6. Quy ước

- Ngôn ngữ giao diện: **tiếng Việt**. Font phải hỗ trợ đầy đủ dấu tiếng Việt (đã kiểm tra: Playfair Display, Be Vietnam Pro, Oswald, Lora, Great Vibes; **không dùng** Bebas Neue, UnifrakturMaguntia).
- Bảng màu kế thừa áo lễ UIT: navy `#13235e`, xanh lá `#1e9a52`, vàng `#ffcf33`/`#d9b45a`, kem `#f6f2e9`.
- Dòng chữ tiêu đề tiếng Việt cần `line-height ≥ 1.05` để dấu không chạm dòng trên.

Xem thêm: [DESIGN-BRIEF.md](DESIGN-BRIEF.md) · [RESOURCES.md](RESOURCES.md)
