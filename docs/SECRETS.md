# Dữ liệu cá nhân & GitHub Secrets

Repo này **public**. Chỉ có **một** dữ liệu được giữ bí mật qua GitHub Secret: **số điện thoại**.

## Phân loại dữ liệu (đã chốt 19/11/2026)

| Dữ liệu | Lưu ở đâu | Lý do |
|---|---|---|
| Số điện thoại liên hệ | 🔒 **`SECRET_PHONE`** (GitHub Secret) | Chủ nhân không muốn số nằm trong repo |
| Tên người gửi (tân khoa) | `src/config/event.json` → `host.name` | Chủ nhân đồng ý công khai |
| Danh sách khách (path, xưng hô, tên, lời nhắn) | `data/guests.json` (commit) | Chủ nhân tự điền bằng `npm run guests` |
| Ảnh tốt nghiệp | `public/images/` | Chủ nhân đồng ý; ảnh đã xoá metadata EXIF |
| Ngày, giờ, địa điểm | `src/config/event.json` | Thông tin công khai của sự kiện |

> `data/guests.json` nằm trong repo public, nên ai mở repo trên GitHub cũng thấy path và tên khách. Nếu sau này muốn giấu danh sách khách, chuyển file này sang một secret theo cách giống `SECRET_PHONE`.

## Cấu hình `SECRET_PHONE`

**GitHub → repo → Settings → Secrets and variables → Actions → New repository secret**, tên `SECRET_PHONE`. Hoặc chạy:

```bash
gh secret set SECRET_PHONE --repo BaoVStorm/graduation-invitation
```

Sau đó vào **Actions → Deploy to GitHub Pages → Run workflow** để build lại.

## Cơ chế bảo vệ số điện thoại

1. **Không vào bundle JS:** secret chỉ được đọc trong `scripts/` (Node, lúc build). Vite đặt `envPrefix: 'PUBLIC_'`, nên `SECRET_*` không lọt vào `import.meta.env`.
2. **Chỉ trang khách mới có số:** số được nhúng vào `dist/<code>/index.html`. Trang chung `/` và trang `404` không có.
3. **Không lập chỉ mục:** mọi trang đều có `noindex, nofollow`.
4. **Log CI** chỉ in "đã cấu hình / chưa cấu hình".

> Ai có link của khách thì xem được số điện thoại trên trang đó. Đó là mục đích của nút Gọi/Zalo.

## Quản lý khách mời (chạy ở máy)

Toàn bộ danh sách khách nằm trong **`data/guests.json`**, ngay trong source. Mỗi khách là **một path riêng**:

```
https://baovstorm.github.io/graduation-invitation/thanhvinh   →  "Gửi Bạn Thành Vinh"
https://baovstorm.github.io/graduation-invitation/ngocthinh   →  "Gửi Anh Ngọc Thịnh"
```

Mở menu bằng lệnh:

```bash
npm run guests
```

Menu có 4 việc: **thêm**, **sửa**, **xoá** và **xem danh sách**. Khi thêm, script hỏi lần lượt:

| Câu hỏi | Ví dụ | Ghi chú |
|---|---|---|
| Tên khách | `Thành Vinh` | Bắt buộc |
| Xưng hô | `Bạn` | Gợi ý: Bạn, Anh, Chị, Em, Thầy, Cô… Được ghép trước tên và dùng trong câu văn. |
| Path | `thanhvinh` | Tự gợi ý từ tên (bỏ dấu, viết liền). Chỉ gồm `a-z 0-9 -`, dài 3–32 ký tự, không được trùng. |
| Bạn tự xưng là | `mình` / `em` | Tự gợi ý "em" khi khách là Anh, Chị, Thầy, Cô |
| Lời nhắn riêng | `Cảm ơn Vinh vì…` | Hiện trong trang thư ngỏ. Bỏ trống thì dùng câu mặc định. |

Script hiện bản xem trước, hỏi xác nhận, ghi vào `data/guests.json` rồi in ra **link để gửi khách**. Để xem nhanh toàn bộ link:

```bash
npm run guests -- list
```

**Đưa lên trang:** commit và push. GitHub Actions tự build lại trong khoảng 1 phút.

```bash
git add data/guests.json && git commit -m "Cập nhật khách mời" && git push
```

> Path dễ đọc như `thanhvinh` thì người khác cũng dễ đoán. Đó là đánh đổi để link dễ nhớ. Nếu cần kín hơn, đặt path khó đoán (ví dụ `thanhvinh-k7m2`).

Có thể sửa trực tiếp `data/guests.json`:

```json
{
  "guests": [
    { "code": "ngocthinh", "honorific": "Anh", "name": "Ngọc Thịnh", "self": "em", "message": "Cảm ơn anh…" }
  ]
}
```

`code` là path. `self` bỏ trống nghĩa là "mình". Path trùng hoặc sai định dạng sẽ làm build dừng và báo lỗi.

## Chạy ở máy

```bash
cp .env.example .env.local
```

Điền `SECRET_PHONE` vào `.env.local`, chạy `npm run dev` rồi mở `http://localhost:5173/thanhvinh`.
