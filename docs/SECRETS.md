# Dữ liệu cá nhân & GitHub Secrets

Repo này **public**. Mọi dữ liệu cá nhân được đưa vào lúc build qua **GitHub Secrets** và không bao giờ được commit.

## Phân loại dữ liệu

| Dữ liệu | Cá nhân? | Lưu ở đâu | Ghi chú |
|---|---|---|---|
| Số điện thoại liên hệ | ✅ | **`SECRET_PHONE`** | Dùng cho nút Gọi và Zalo |
| Tên người gửi (tân khoa) | ✅ | **`SECRET_HOST_NAME`** | Không bắt buộc; để trống thì trang dùng "mình" |
| Danh sách khách: mã, xưng hô, tên, lời nhắn riêng | ✅ | **`SECRET_GUESTS_JSON`** | Tên và lời nhắn của người khác là dữ liệu của họ |
| Ảnh tốt nghiệp | ⚠️ | `public/images/` (commit) | Chủ nhân đã đồng ý; ảnh đã xoá metadata EXIF |
| Ngày, giờ, địa điểm, tên trường | ❌ | `src/config/event.json` | Thông tin công khai của sự kiện |
| Link Zalo | (từ số điện thoại) | Tạo tự động từ `SECRET_PHONE` | Không cần secret riêng |

## Cấu hình (làm một lần)

Vào **GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**, hoặc dùng `gh`:

```bash
gh secret set SECRET_PHONE --repo BaoVStorm/graduation-invitation-3d
```

```bash
gh secret set SECRET_HOST_NAME --repo BaoVStorm/graduation-invitation-3d
```

```bash
gh secret set SECRET_GUESTS_JSON --repo BaoVStorm/graduation-invitation-3d < data/guests.json
```

Hai lệnh đầu sẽ hỏi giá trị (nhập ẩn). Lệnh thứ ba lấy nội dung từ file `data/guests.json` ở máy (file này đã có trong `.gitignore`). Sau khi đổi secret, vào tab **Actions → Deploy to GitHub Pages → Run workflow** để build lại.

### Định dạng `SECRET_GUESTS_JSON`

```json
[
  { "code": "a7k2", "honorific": "Anh", "name": "Minh", "message": "Lời nhắn riêng (không bắt buộc)" },
  { "code": "q9xm", "honorific": "Bạn", "name": "Lan" }
]
```

- `code`: 3–32 ký tự `a-z`, `0-9`, `-`. Đây là đường dẫn của khách: `https://<site>/a7k2/`. Nên dùng mã ngẫu nhiên, không dùng tên thật.
- Không được dùng các mã `assets`, `images`, `index`, `404`. Mã trùng hoặc sai định dạng sẽ làm build dừng và báo lỗi rõ ràng.

## Cơ chế bảo vệ

1. **Không vào bundle JS:** secret chỉ được đọc trong `scripts/` (Node, lúc build). Vite đặt `envPrefix: 'PUBLIC_'`, nên biến `SECRET_*` không thể lọt vào `import.meta.env`.
2. **Chỉ trang khách mới có dữ liệu:** `dist/<code>/index.html` chứa tên và lời nhắn của **đúng khách đó**, kèm số điện thoại. Trang chung `/` và trang `404` **không chứa secret nào**. Không có file nào chứa toàn bộ danh sách khách.
3. **Không lập chỉ mục:** mọi trang có `noindex, nofollow`, nên Google không liệt kê.
4. **Log CI** chỉ in "đã cấu hình / chưa cấu hình", không in giá trị.

> ⚠️ Giới hạn: ai có link của một khách thì xem được số điện thoại trên trang đó. Đây là bản chất của thư mời. Secret giúp dữ liệu **không nằm trong mã nguồn và lịch sử git**, chứ không giấu được khỏi người nhận link.

## Chạy ở máy

```bash
cp .env.example .env.local
```

Điền giá trị vào `.env.local` (hoặc tạo `data/guests.json`), rồi chạy `npm run dev` và mở `http://localhost:5173/a7k2`.
