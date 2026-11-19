# Kịch bản hiển thị UI

> Kịch bản này là "nguồn sự thật" cho trải nghiệm. Code ở `src/scenes/*` và `src/three/*` phải bám theo đúng thứ tự, thời lượng và cảm xúc mô tả ở đây. Khi muốn đổi trải nghiệm, sửa file này trước rồi mới sửa code.

## Hai loại trang

| Đường dẫn | Trải nghiệm |
|---|---|
| `/<path khách>` (ví dụ `/thanhvinh`) | **Luồng thư mời 10 cảnh** bên dưới, cá nhân hoá theo tên khách |
| `/` (trang chính) và path không tồn tại | **Thông báo tốt nghiệp:** không có tên người nhận, không có lời mời, không có số điện thoại |

### Trang chính: thông báo tốt nghiệp

| t | Sự kiện |
|---|---|
| 0.2s | Dòng nhỏ *"THÔNG BÁO TỐT NGHIỆP · CLASS OF 2026"* |
| 0.1–1.2s | Bìa tạp chí GRADUATE. rơi xuống, các chữ masthead rơi từng ký tự, cover line trượt vào |
| 2.0s | Sticker "CHÍNH THỨC RA TRƯỜNG!" bật ra |
| 2.2s | **Mũ tốt nghiệp và pháo giấy 3D** |
| 2.3s | Headline *"Chính thức tốt nghiệp — hành trình mới bắt đầu."* và ngày lễ |
| 2.7s | Lời cảm ơn, tên + MSSV tân khoa, nút **"Gửi lời chúc"**. Bấm nút mở bảng trượt từ dưới lên (tên + lời chúc). Gửi xong thì bắn pháo giấy. |

## Mạch cảm xúc

```
tò mò ──► hồi hộp ──► bất ngờ ──► hào hứng ──► tự hào ──► xúc động ──► vỡ òa ──► rõ ràng
 Intro     Phong bì    Mở thư      Vé bay      Tạp chí    Thư ngỏ     Tung mũ    Thông tin
```

Nguyên tắc:
- **Khách là nhân vật chính.** Tên khách xuất hiện ở 4 điểm chạm: lời dẫn, mặt phong bì, vé bay và thư ngỏ.
- **Khách tự bấm để đi tiếp** ở các nhịp quan trọng (mở thư, lên máy bay, mở tạp chí, tung mũ) để có cảm giác chính mình mở quà. Chỉ cảnh chuyển tiếp (bay) là tự chạy.
- **Nút "Bỏ qua ›"** luôn có ở góc phải từ Intro đến Tung mũ, bấm vào là tới thẳng phần Thông tin. Khách mở lại link lần thứ hai vẫn xem được nhanh.
- Thanh tiến trình 7 chấm ở trên cùng cho biết đang ở chặng nào.

## Thời lượng

| # | Cảnh | Thời lượng | Chuyển cảnh |
|---|---|---|---|
| 0 | Loading | 1.8–3s | tự động |
| 1 | Intro: lời dẫn và tên khách | ~5s | **chạm "Mở thư"** |
| 2 | Phong bì 3D | chờ khách | **chạm con dấu** |
| 3 | Mở thư (3D) | 2.6s | tự động |
| 4 | Vé Graduation Air | ~3s + chờ | **chạm "Lên máy bay"** |
| 5 | Chuyến bay | 3.2s | tự động |
| 6 | Bìa tạp chí GRADUATE. | ~2.5s + chờ | **chạm "Mở số đặc biệt"** |
| 7 | Thư ngỏ (trang trong tạp chí) | ~4s + chờ | **chạm "Tung mũ"** |
| 8 | Tung mũ, confetti, đếm ngược | ~4s | **chạm "Xem thông tin"** (hoặc tự động sau 7s) |
| 9 | Thông tin buổi lễ | khách tự cuộn | "Xem lại từ đầu ↺" |

Đi hết luồng mất khoảng **40–60 giây**.

---

## Cảnh 0: Loading

- **Nền:** navy sâu `#0a1440`, các hạt bụi vàng 3D bắt đầu xuất hiện mờ dần.
- **Giữa màn hình:** một chiếc máy bay giấy nhỏ chạy dọc thanh tiến trình mảnh màu vàng.
- **Chữ:** *"Đang in vé mời cho {Tên khách}…"*. Trang chung thì dùng *"Đang chuẩn bị thư mời…"*.
- **Việc thật phải chờ:** tải font (Playfair, Oswald, Great Vibes, Be Vietnam Pro) và giải mã ảnh. Tối thiểu 1.8s để không bị chớp.
- **Thoát:** thanh đầy, cả khối mờ dần và bay lên (0.5s).

## Cảnh 1: Intro, lời dẫn

Nền vẫn là bụi vàng 3D. Hạt trôi chậm, nghiêng nhẹ theo ngón tay hoặc con trỏ.

| t | Sự kiện |
|---|---|
| 0.0s | Dòng 1 hiện từng chữ (mờ sang rõ, chữ nhích lên 8px): *"Có những chặng đường rất dài…"* |
| 1.6s | Dòng 2: *"…và có những khoảnh khắc chỉ đến một lần."* |
| 3.4s | Hai dòng tan đi. Hiện dòng nhỏ chữ hoa giãn rộng: **MỘT LÁ THƯ DÀNH RIÊNG CHO** |
| 3.8s | **Tên khách** hiện từng ký tự bằng chữ serif đậm màu vàng, có quầng sáng. Mỗi ký tự cách nhau 45ms. |
| 4.8s | Nút **"✉ Mở thư"** nảy lên, viền vàng nhấp nháy như nhịp thở (pulse 1.6s). |

Khi khách chạm: xin quyền con quay hồi chuyển (iOS), dòng chữ tan, sang cảnh 2.

## Cảnh 2: Phong bì 3D

- Phong bì giấy kem (WebGL) **bay từ dưới lên**, xoay về thẳng (1.4s, power3.out), sau đó **lơ lửng** nhấp nhô.
- Phong bì **nghiêng theo ngón tay, con trỏ hoặc độ nghiêng điện thoại**, tối đa khoảng 20°.
- **Mặt phong bì:** dòng *"THƯ MỜI LỄ TỐT NGHIỆP · 2026"*, chữ *"Gửi"* viết tay và **tên khách** in đậm màu navy.
- **Sáp niêm phong đỏ** in số "2026" màu vàng ở đỉnh nắp.
- **Gợi ý dưới màn hình:** *"Chạm vào con dấu để mở"*, có vòng sáng lan ra.

## Cảnh 3: Mở thư (3D, tự chạy 2.6s)

| t | Sự kiện |
|---|---|
| 0.00s | Sáp phồng lên (×1.3) và **lóe sáng vàng** |
| 0.15s | Sáp vỡ: thu nhỏ và xoay văng đi, bụi vàng bắn ra |
| 0.40s | **Nắp phong bì lật mở** quanh mép trên (0.8s) |
| 1.20s | **Tấm vé** (navy, chữ vàng "GRADUATION AIR") **trượt lên** khỏi phong bì |
| 1.90s | Camera **lao về phía tấm vé**, phong bì chìm xuống |
| 2.40s | Màn hình **lóe trắng ánh vàng** rồi chuyển sang cảnh 4 |

## Cảnh 4: Vé Graduation Air

Vé được làm theo mẫu PNG đã duyệt: header navy, ảnh tân khoa, tuyến SV → TK, hành khách, ngày, cổng và ghế, đường xé, mã vạch.

| t | Sự kiện |
|---|---|
| 0.0s | Vé **lật từ mặt sau ra mặt trước** (rotateY −180° → 0°, 1.2s). Mặt sau là họa tiết logo Graduation Air. |
| 1.0s | Các dòng thông tin hiện dần từ trên xuống, mỗi dòng cách nhau 80ms |
| 1.4s | **Tên khách** ở ô HÀNH KHÁCH hiện như đang được in: từng ký tự, có con trỏ nhấp nháy |
| 2.2s | **Con dấu "ĐÃ CHECK-IN ✓" đóng mạnh xuống** (scale 2.4 → 1, xoay −12°), vé rung nhẹ |
| 2.8s | Nút **"✈ Lên máy bay"** hiện ra |

- Vé luôn **nghiêng 3D** theo tay hoặc con quay hồi chuyển. Lớp **foil hologram** cầu vồng chạy theo góc nghiêng.
- Dòng gợi ý nhỏ: *"Nghiêng điện thoại để thấy ánh hologram"*.

## Cảnh 5: Chuyến bay (tự chạy 3.2s)

- Vé thu nhỏ và trượt sang trái, nền chuyển thành bầu trời đêm có **mây trôi qua theo 3 lớp parallax** với tốc độ khác nhau.
- **Đường bay nét đứt** vẽ dần từ **SINH VIÊN** đến **TÂN KHOA**, máy bay chạy theo đường cong.
- Chữ giữa màn hình: *"Đang bay đến…"* rồi đổi thành **"Tương lai ✦"**.
- Hết cảnh, mây tản ra để lộ bìa tạp chí.

## Cảnh 6: Bìa tạp chí GRADUATE.

Bìa làm theo mẫu PNG đã duyệt: ảnh tràn bìa, masthead GRADUATE., cover line, sticker "CHÍNH THỨC RA TRƯỜNG!", headline phía dưới.

| t | Sự kiện |
|---|---|
| 0.0s | Cuốn tạp chí **rơi từ trên xuống** và lật về thẳng (rotateX 70° → 0°, 1.1s, nảy nhẹ khi dừng) |
| 0.8s | Masthead **G-R-A-D-U-A-T-E** rơi xuống **từng chữ** (stagger 60ms) |
| 1.4s | Cover line hai bên trượt vào. Số "2026" viền vẽ dần nét. |
| 1.9s | Sticker đỏ **bật ra** (scale 0 → 1.15 → 1, xoay) |
| 2.3s | Headline *"Ngày ấy đã đến — và mình muốn có bạn."* hiện. Nút **"Mở số đặc biệt →"** xuất hiện. |

- **Parallax 3D theo lớp:** ảnh nằm ở mặt sau (Z = 0), masthead ở Z = 30px, cover line ở 50px, sticker ở 80px. Khi nghiêng sẽ thấy các lớp có chiều sâu.

## Cảnh 7: Thư ngỏ

- Bìa **lật mở như lật trang tạp chí**: xoay quanh gáy trái −165° trong 1.2s, bóng đổ chạy theo. Bên dưới là **trang thư** màu giấy kem.
- Nội dung trang thư hiện lần lượt như đang được viết, mỗi dòng cách nhau khoảng 350ms:
  1. *"Gửi {Tên khách},"* bằng chữ viết tay màu vàng đồng
  2. **Lời nhắn riêng** (trường `message` của khách), in nghiêng
  3. Đoạn chung: *"Sau những năm tháng miệt mài, mình sắp chính thức trở thành tân khoa. Ngày vui ấy sẽ trọn vẹn hơn rất nhiều nếu có {xưng hô} ở đó."*
  4. **Chữ ký** (tên chủ nhân) được vẽ dần nét như viết tay
- Nút **"🎓 Tung mũ ăn mừng"**.

## Cảnh 8: Tung mũ

- **3D:** 7 chiếc mũ tốt nghiệp bay lên từ dưới, xoay tròn rồi rơi xuống. Cùng lúc **pháo giấy 3D** nổ 2 đợt (300 mảnh màu vàng, xanh lá, trắng, navy) và rơi chậm, lật lả tả.
- **DOM:** chữ lớn **"Hẹn gặp {Tên khách}!"**, bên dưới là **đồng hồ đếm ngược** đến ngày lễ (Ngày : Giờ : Phút : Giây) với số lật.
- Nút **"Xem thông tin buổi lễ ↓"**. Nếu khách không bấm, tự chuyển sau 7s.

## Cảnh 9: Thông tin buổi lễ

Màn hình tĩnh, rõ ràng, cuộn được. Đây là phần khách sẽ mở lại nhiều lần. Các thẻ hiện lần lượt (stagger 90ms):

1. **Đầu trang:** ảnh tròn nhỏ, chữ *"Hẹn gặp {Tên khách} tại"*, tên sự kiện
2. **Thời gian:** thứ, ngày, giờ (nếu chưa có giờ thì ghi *"Giờ cụ thể sẽ báo sau"*)
3. **Địa điểm:** tên trường và nút **Mở Google Maps**
4. **Lưu vào lịch:** **Google Calendar** và **Tải file .ics** (Apple/Outlook)
5. **Liên hệ** (chỉ có trên trang khách): **Gọi** và **Zalo**
6. **Gửi lời chúc:** form tên (điền sẵn tên khách) + lời chúc, gửi thẳng vào email tân khoa (`SECRET_WISH_EMAIL`)
7. **Chân trang:** *"Sự có mặt của bạn là món quà ý nghĩa nhất."* và nút **"↺ Xem lại từ đầu"**

## Âm thanh

Toàn bộ âm thanh được **tạo bằng Web Audio API** trong `src/lib/audio.ts`, không dùng file nên không vướng bản quyền và không tốn dung lượng tải.

- **Nhạc nền:** bài *"Motivation"* của AtlasAudio (Pixabay, dùng miễn phí, không cần ghi nguồn), lưu ở `public/audio/motivation.mp3`. File đã được chuẩn hoá âm lượng về -16 LUFS, có đoạn nhỏ dần 3 giây ở cuối để lặp mượt, nén 128kbps (1.4 MB). Nếu file lỗi, trang tự chuyển sang giai điệu hộp nhạc tổng hợp (C – G – Am – F, 76 BPM).
- **Bắt đầu** khi khách chạm "Mở thư" (hoặc "Gửi lời chúc mừng" ở trang chính), vì trình duyệt chặn âm thanh trước lần chạm đầu tiên. Nhạc tự dừng khi khách chuyển sang tab khác.
- **Bảng âm thanh** (bấm nút loa ở góc phải): công tắc bật/tắt, thanh **Nhạc nền** (mặc định 70%) và thanh **Hiệu ứng** (mặc định 80%). Lựa chọn được ghi nhớ trên máy khách.
- **Muốn dùng nhạc thật:** chép file vào `public/audio/` và đặt `"music": "audio/ten-file.mp3"` trong `src/config/event.json`. Nhạc tổng hợp sẽ được thay bằng file đó.

| Cảnh | Hiệu ứng (thời điểm) |
|---|---|
| Chạm "Mở thư" | `whoosh` |
| Phong bì bay vào | `slide` |
| Mở thư | `crack` sáp vỡ (0.12s), `paper` lật nắp (0.45s), `slide` vé trượt ra (1.2s), `whoosh` camera lao tới (1.85s) |
| Vé | `whoosh` khi lật, `tick` theo từng ký tự tên, `stamp` khi đóng dấu (2.53s) |
| Lên máy bay / chuyến bay | `whoosh`, `plane` (0.1s), `chime` khi hiện "Tương lai" (1.9s) |
| Tạp chí | `drop` khi chạm xuống (0.95s), `chime` lúc masthead rơi, `pop` khi sticker bật ra (2.0s) |
| Thư ngỏ | `paper` khi lật bìa, `scribble` khi ký tên (2.4s) |
| Tung mũ | `whoosh` và 2 đợt `confetti` (0.15s, 1.25s) |
| Mọi nút vàng | `tap` |

## Trường hợp đặc biệt

| Tình huống | Xử lý |
|---|---|
| Không có WebGL | Bỏ cảnh 2–3. Intro chuyển thẳng sang Vé, các cảnh DOM vẫn đầy đủ. Cảnh Tung mũ chỉ còn đếm ngược. |
| `prefers-reduced-motion` | Vào thẳng cảnh 9 (Thông tin), không có chuyển động lớn |
| Trang chung (không có mã) | Tên khách hiện là "Bạn", không có liên hệ, không có lời nhắn riêng |
| Sau ngày lễ | Đồng hồ đếm ngược đổi thành *"Cảm ơn vì đã đến!"* |
| Màn hình thấp (< 640px chiều cao) | Vé và bìa co theo chiều cao (`svh`), nút luôn nằm trong màn hình |
