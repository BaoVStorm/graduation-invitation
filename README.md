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

🚧 **Giai đoạn 0: khởi tạo.** Repo hiện mới có tài liệu định hướng, phần code sẽ được thêm ở bước tiếp theo.

| Tài liệu | Nội dung |
|---|---|
| [docs/CONTEXT.md](docs/CONTEXT.md) | Bối cảnh, thông tin sự kiện, quyết định kỹ thuật, quyền riêng tư |
| [docs/DESIGN-BRIEF.md](docs/DESIGN-BRIEF.md) | Prompt thiết kế, storyboard từng cảnh, checklist chất lượng |
| [docs/RESOURCES.md](docs/RESOURCES.md) | Thư viện, tài sản 3D, nguồn cảm hứng, công cụ |

## Stack dự kiến

Vite · React · TypeScript · React Three Fiber · drei · GSAP · Motion · Tailwind CSS. Deploy lên GitHub Pages.

## Thêm khách mời

1. Copy `data/guests.example.json` thành `data/guests.json` (file này không được commit).
2. Thêm khách theo dạng `{ "code": "abc1", "honorific": "Anh", "name": "Minh", "message": "..." }`.
3. Build: mỗi mã sẽ được prerender thành một trang riêng, có ảnh preview khi gửi link.
