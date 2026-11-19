# Dữ liệu cá nhân & GitHub Secrets

Repo này **public**. Chỉ có **một** dữ liệu được giữ bí mật qua GitHub Secret: **số điện thoại**.

## Phân loại dữ liệu (đã chốt 19/11/2026)

| Dữ liệu | Lưu ở đâu | Lý do |
|---|---|---|
| Số điện thoại liên hệ | 🔒 **`SECRET_PHONE`** (GitHub Secret) | Chủ nhân không muốn số nằm trong repo |
| Tên người gửi (tân khoa) | `src/config/event.json` → `host.name` | Chủ nhân đồng ý công khai |
| Danh sách khách (mã, xưng hô, tên, lời nhắn) | `data/guests.json` (commit) | Chủ nhân tự cấu hình. Mỗi khách có mã ngẫu nhiên riêng. |
| Ảnh tốt nghiệp | `public/images/` | Chủ nhân đồng ý; ảnh đã xoá metadata EXIF |
| Ngày, giờ, địa điểm | `src/config/event.json` | Thông tin công khai của sự kiện |

> ⚠️ `data/guests.json` nằm trong repo public, nên ai mở repo trên GitHub cũng thấy các mã và tên khách. Mã ngẫu nhiên chỉ ngăn người **không xem repo** đoán ra đường dẫn. Nếu sau này muốn giấu cả danh sách khách, chuyển file này sang một secret theo cách giống `SECRET_PHONE`.

## Cấu hình `SECRET_PHONE`

**GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**, tên `SECRET_PHONE`. Hoặc chạy:

```bash
gh secret set SECRET_PHONE --repo BaoVStorm/graduation-invitation-3d
```

Sau đó vào **Actions → Deploy to GitHub Pages → Run workflow** để build lại.

## Cơ chế bảo vệ số điện thoại

1. **Không vào bundle JS:** secret chỉ được đọc trong `scripts/` (Node, lúc build). Vite đặt `envPrefix: 'PUBLIC_'`, nên `SECRET_*` không lọt vào `import.meta.env`.
2. **Chỉ trang khách mới có số:** số được nhúng vào `dist/<code>/index.html`. Trang chung `/` và trang `404` không có.
3. **Không lập chỉ mục:** mọi trang đều có `noindex, nofollow`.
4. **Log CI** chỉ in "đã cấu hình / chưa cấu hình".

> Ai có link của khách thì xem được số điện thoại trên trang đó. Đó là mục đích của nút Gọi/Zalo.

## Thêm khách

```bash
npm run guest:add -- "Anh" "Minh" "Lời nhắn riêng (không bắt buộc)"
```

Lệnh này tạo mã ngẫu nhiên 8 ký tự, ghi vào `data/guests.json` và in ra đường dẫn để gửi. Có thể sửa file trực tiếp:

```json
{
  "guests": [
    { "code": "k7m2qx9p", "honorific": "Anh", "name": "Minh", "self": "em", "message": "Cảm ơn anh đã luôn chỉ dẫn em." }
  ]
}
```

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `code` | ✅ | Đường dẫn `/<code>/`. 3–32 ký tự `a-z 0-9 -`. Không dùng `assets`, `images`, `index`, `404`. |
| `name` | ✅ | Tên khách |
| `honorific` | | Xưng hô: Anh, Chị, Bạn, Cô, Thầy… (ghép trước tên, và dùng trong câu văn) |
| `self` | | Chủ nhân tự xưng với khách này: `mình` (mặc định), `em`, `con`… |
| `message` | | Lời nhắn riêng, hiện trong trang thư ngỏ |

Mã trùng hoặc sai định dạng sẽ làm build dừng và báo lỗi.

## Chạy ở máy

```bash
cp .env.example .env.local
```

Điền `SECRET_PHONE` vào `.env.local`, chạy `npm run dev` rồi mở `http://localhost:5173/demo`.
