# 🎓 Graduation Invitation 3D

Website thư mời tốt nghiệp 3D, **mỗi khách một đường dẫn riêng** nhưng dùng chung một source code. Chỉ cần đổi dữ liệu.

```
https://<domain>/a7k2  →  "Gửi Anh Minh"
https://<domain>/q9xm  →  "Gửi Bạn Lan"
https://<domain>/      →  bản mời chung
```

## Concept

Trang mở đầu bằng một phong bì 3D. Khi bẻ sáp niêm phong, **vé máy bay "Graduation Air" (Sinh viên → Tân khoa)** in tên khách sẽ trượt ra. Cuộn xuống là **bìa tạp chí "GRADUATE."**, cảnh tung mũ có confetti, rồi đến thông tin sự kiện, nút thêm vào lịch và chỉ đường.

## Trạng thái

🚧 **Giai đoạn 1: khung dữ liệu.** Đã có định tuyến theo mã, prerender từng trang khách, đọc dữ liệu cá nhân từ GitHub Secrets và workflow deploy lên GitHub Pages. Trải nghiệm 3D sẽ được thêm ở giai đoạn 2.

| Tài liệu | Nội dung |
|---|---|
| [docs/CONTEXT.md](docs/CONTEXT.md) | Bối cảnh, thông tin sự kiện, quyết định kỹ thuật, quyền riêng tư |
| [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) | Prompt thiết kế, storyboard từng cảnh, checklist chất lượng |
| [docs/RESOURCES.md](docs/RESOURCES.md) | Thư viện, tài sản 3D, nguồn cảm hứng, công cụ |
| [docs/SECRETS.md](docs/SECRETS.md) | Dữ liệu cá nhân, cách cấu hình GitHub Secrets |

## Stack dự kiến

Vite · React · TypeScript · React Three Fiber · drei · GSAP · Motion · Tailwind CSS. Deploy lên GitHub Pages.

## Thêm khách mời

Danh sách khách, số điện thoại và tên người gửi **không nằm trong repo** mà được nạp từ GitHub Secrets (`SECRET_GUESTS_JSON`, `SECRET_PHONE`, `SECRET_HOST_NAME`). Xem hướng dẫn trong [docs/SECRETS.md](docs/SECRETS.md).

## Chạy ở máy

```bash
npm install
cp .env.example .env.local   # điền SECRET_* hoặc tạo data/guests.json
npm run dev                  # mở http://localhost:5173/<code>
npm run build                # dist/<code>/index.html cho từng khách
```
