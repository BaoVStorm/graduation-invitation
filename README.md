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

✨ **Giai đoạn 2: trải nghiệm 3D.** Có đủ 10 cảnh theo [kịch bản UI](docs/UI-SCRIPT.md): loading, lời dẫn, phong bì 3D mở sáp, vé Graduation Air có ánh hologram, chuyến bay, bìa tạp chí lật trang, thư ngỏ, tung mũ có confetti 3D, đếm ngược, thông tin cùng nút lưu lịch và chỉ đường.

| Tài liệu | Nội dung |
|---|---|
| [docs/CONTEXT.md](docs/CONTEXT.md) | Bối cảnh, thông tin sự kiện, quyết định kỹ thuật, quyền riêng tư |
| [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) | Prompt thiết kế, storyboard từng cảnh, checklist chất lượng |
| [docs/RESOURCES.md](docs/RESOURCES.md) | Thư viện, tài sản 3D, nguồn cảm hứng, công cụ |
| [docs/UI-SCRIPT.md](docs/UI-SCRIPT.md) | Kịch bản hiển thị 10 cảnh: thời lượng, chuyển động, cảm xúc |
| [docs/SECRETS.md](docs/SECRETS.md) | Dữ liệu cá nhân, `SECRET_PHONE`, cách thêm khách |

## Stack

Vite · React · TypeScript · React Three Fiber · drei · GSAP · Motion · Tailwind CSS. Deploy lên GitHub Pages.

## Thêm khách mời

```bash
npm run guest:add -- "Anh" "Minh" "Lời nhắn riêng"
```

Lệnh này tạo mã ngẫu nhiên trong `data/guests.json` và in ra link để gửi. Số điện thoại lấy từ GitHub Secret `SECRET_PHONE`. Xem [docs/SECRETS.md](docs/SECRETS.md).

## Chạy ở máy

```bash
npm install
cp .env.example .env.local   # điền SECRET_PHONE
npm run dev                  # mở http://localhost:5173/demo
npm run build                # dist/<code>/index.html cho từng khách
```
