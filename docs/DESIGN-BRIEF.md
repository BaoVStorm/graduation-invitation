# Design Brief & Prompt làm việc

> Đây là "prompt" tự viết để dẫn hướng khi xây trang. Mỗi lần code một phần, đối chiếu lại với brief này.

## Prompt gốc

> Xây một trải nghiệm thư mời tốt nghiệp **cá nhân hóa theo từng khách**, cảm giác như **mở một món quà 3D**. Trang phải kể chuyện "từ Sinh viên đến Tân khoa" theo hai concept đã được chọn: **bìa tạp chí GRADUATE.** và **vé máy bay Graduation Air**. Mọi chuyển động phải có mục đích (dẫn mắt, tạo bất ngờ, nhấn thông tin), không chỉ để trang trí. Mở trên điện thoại phải mượt 60fps. Khách phải thấy **tên mình** ngay từ giây đầu tiên. Thông tin quan trọng (ngày, giờ, địa điểm, liên hệ) phải đọc được trong 5 giây, kể cả khi tắt 3D.

## Hành trình người xem (storyboard)

| # | Cảnh | Nội dung | Hiệu ứng 3D / chuyển động |
|---|---|---|---|
| 0 | **Intro** | Màn tối, hạt vàng lơ lửng. Một **phong bì 3D** bay vào, sáp niêm phong có chữ "2026". Dòng chữ: *"Gửi {honorific} {name}"*. | R3F: phong bì là mesh có texture giấy, xoay nhẹ theo con trỏ hoặc gyroscope. Particles dùng `Points` và shader. |
| 1 | **Mở thư** | Chạm vào để bẻ sáp. Nắp phong bì lật mở, **tấm vé Graduation Air** trượt ra rồi lật về phía camera. | GSAP timeline: rotation nắp, translate vé, camera dolly-in. Có âm thanh "giấy" (tùy chọn). |
| 2 | **Boarding pass** | Vé 3D hiển thị: Hành khách = **tên khách**, SV → TK, ngày bay 27 NOV 2026, cổng khởi hành UIT, ghế VIP. | Vé có **foil hologram shader** đổi màu theo góc nghiêng, có đục lỗ răng cưa. Kéo để xoay 360°. |
| 3 | **Bìa tạp chí** | Cuộn xuống, vé thu nhỏ lại, một **cuốn tạp chí GRADUATE.** mở ra với ảnh chủ nhân và các cover line vui. | Lật trang 3D (page curl) hoặc parallax nhiều lớp: ảnh, chữ masthead, sticker ở các độ sâu khác nhau. |
| 4 | **Khoảnh khắc** | Tung mũ tốt nghiệp: mũ 3D bay lên, confetti nổ. Đồng hồ đếm ngược đến ngày lễ. | Mũ có vật lý đơn giản (spring). Confetti chạy GPU-instanced. |
| 5 | **Thông tin** | Thẻ thông tin: Thời gian, Địa điểm (nút mở Google Maps), Liên hệ (nút gọi hoặc mở Zalo), nút **Thêm vào lịch** (.ics / Google Calendar). | Card tilt nhẹ. Đây là phần 2D rõ ràng, không lạm dụng 3D. |
| 6 | **Lời nhắn** | Lời nhắn riêng cho từng khách (nếu có), chữ ký tay. Câu kết *"Sự có mặt của bạn là món quà ý nghĩa nhất."* | Chữ ký vẽ dần (SVG stroke animation). |

## Nguyên tắc chất lượng

1. **Cá nhân hóa là nhân vật chính:** tên khách xuất hiện ở intro, trên vé và trong lời nhắn.
2. **Mobile-first:** thiết kế cho màn 390×844 trước, desktop chỉ là bản mở rộng.
3. **Có fallback:** khi không có WebGL hoặc bật `prefers-reduced-motion`, hiện bản 2D đẹp (dựa trên bản PNG đã duyệt).
4. **Hiệu năng:** `dpr={[1, 2]}`, `PerformanceMonitor` để tự hạ chất lượng, texture KTX2/WebP, model nén Draco.
5. **Tiếp cận:** nút có nhãn rõ, tương phản AA, tôn trọng hệ điều hành khi tắt chuyển động.
6. **Không dùng logo hay nhận diện chính thức của trường làm "brand" của trang.** Chỉ ghi tên trường ở mục địa điểm. Hình ảnh trường có sẵn trong ảnh chụp thì giữ nguyên.

## Checklist hoàn thiện

- [ ] Đúng dữ liệu theo từng mã, mã sai thì hiện bản mời chung
- [ ] OG preview riêng từng khách (test bằng cách dán link vào Zalo/Messenger)
- [ ] Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95
- [ ] Test trên iPhone Safari và Android Chrome (máy tầm trung)
- [ ] Nút thêm vào lịch, mở bản đồ và gọi điện đều hoạt động
- [ ] Nhạc nền (nếu có) chỉ phát khi người dùng chạm
