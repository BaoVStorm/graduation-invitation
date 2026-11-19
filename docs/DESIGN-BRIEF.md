# Design Brief & Prompt làm việc

> Đây là "prompt" tự viết để dẫn hướng khi xây trang. Mỗi lần code một phần, đối chiếu lại với brief này.

## Prompt gốc

> Xây một trải nghiệm thư mời tốt nghiệp **cá nhân hóa theo từng khách**, cảm giác như **mở một món quà 3D**. Trang phải kể chuyện "từ Sinh viên đến Tân khoa" theo hai concept đã được chọn: **bìa tạp chí GRADUATE.** và **vé máy bay Graduation Air**. Mọi chuyển động phải có mục đích (dẫn mắt, tạo bất ngờ, nhấn thông tin), không chỉ để trang trí. Mở trên điện thoại phải mượt 60fps. Khách phải thấy **tên mình** ngay từ giây đầu tiên. Thông tin quan trọng (ngày, giờ, địa điểm, liên hệ) phải đọc được trong 5 giây, kể cả khi tắt 3D.

## Hành trình người xem

Kịch bản chi tiết từng cảnh (thời lượng, chuyển động, chữ) nằm trong **[UI-SCRIPT.md](UI-SCRIPT.md)**.

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
