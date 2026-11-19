# Tài nguyên để research & import

Các nguồn được chia theo nhóm. ⭐ là nguồn **dự định dùng trực tiếp** trong repo này. Trước khi đưa tài sản (model, ảnh, font, nhạc) vào trang, cần kiểm tra license (ưu tiên CC0 hoặc MIT).

## 1. Thư viện cốt lõi (import vào code)

| Thư viện | Dùng cho | Link |
|---|---|---|
| ⭐ React Three Fiber | Viết cảnh three.js bằng JSX | https://r3f.docs.pmnd.rs |
| ⭐ drei | Helper cho R3F: `Float`, `Environment`, `Text3D`, `MeshTransmissionMaterial`, `PerformanceMonitor`… | https://drei.docs.pmnd.rs |
| ⭐ three.js | Engine 3D nền tảng, có docs và examples | https://threejs.org/examples |
| ⭐ GSAP (+ ScrollTrigger) | Timeline mở thư, chuyển cảnh theo scroll. Đã miễn phí toàn bộ, kể cả plugin | https://gsap.com/docs |
| ⭐ Motion (trước đây là Framer Motion) | Micro-interaction cho UI 2D | https://motion.dev |
| ⭐ @react-three/postprocessing | Bloom, vignette, chromatic aberration | https://react-postprocessing.docs.pmnd.rs |
| @react-spring/three | Chuyển động kiểu lò xo cho mesh (lật vé, mũ bay) | https://www.react-spring.dev |
| @react-three/rapier | Vật lý (mũ rơi, confetti có va chạm) | https://github.com/pmndrs/react-three-rapier |
| Lenis | Smooth scroll, kết hợp tốt với ScrollTrigger | https://lenis.darkroom.engineering |
| Theatre.js | Chỉnh timeline animation 3D bằng giao diện kéo thả | https://www.theatrejs.com |
| ⭐ canvas-confetti | Confetti 2D nhẹ (bản fallback) | https://github.com/catdad/canvas-confetti |
| Atropos | Thẻ parallax 3D nghiêng bằng CSS, không cần WebGL | https://atroposjs.com |
| ⭐ add-to-calendar-button | Nút "Thêm vào lịch" (Google, Apple, Outlook, .ics) | https://add-to-calendar-button.com |
| qrcode.react | Mã QR in lên vé | https://github.com/zpao/qrcode.react |
| Howler.js | Nhạc nền và hiệu ứng âm thanh | https://howlerjs.com |

## 2. Tài sản 3D (model, HDRI, texture)

| Nguồn | Có gì | Link |
|---|---|---|
| ⭐ Poly Haven | HDRI, texture PBR, model, **CC0** | https://polyhaven.com |
| ⭐ pmndrs/assets | HDRI và model đã nén sẵn cho R3F | https://github.com/pmndrs/assets |
| ambientCG | Texture và HDRI CC0 (giấy, vải satin, kim loại vàng) | https://ambientcg.com |
| Sketchfab | Kho model rất lớn (lọc theo license CC; có model mũ tốt nghiệp, phong bì) | https://sketchfab.com |
| Poly Pizza | Model low-poly miễn phí | https://poly.pizza |
| Quaternius / Kenney | Pack low-poly CC0 | https://quaternius.com · https://kenney.nl |
| three.js Resources (fasani) | Danh sách tổng hợp tài nguyên three.js | https://github.com/fasani/three-js-resources |

**Công cụ xử lý 3D:**
- gltfjsx: chuyển `.glb` thành component React. https://github.com/pmndrs/gltfjsx
- glTF-Transform: nén Draco/Meshopt, texture KTX2/WebP. https://gltf-transform.dev
- Blender: tự dựng phong bì, vé, mũ. https://www.blender.org
- Spline: dựng 3D nhanh trên trình duyệt rồi export. https://spline.design

## 3. Cảm hứng & học kỹ thuật

| Nguồn | Vì sao nên xem | Link |
|---|---|---|
| ⭐ Codrops | Demo WebGL/GSAP có code nguồn (page curl, hologram, particles) | https://tympanus.net/codrops |
| Awwwards | Website đoạt giải, tham khảo chuyển động và bố cục | https://www.awwwards.com |
| Three.js Journey | Khóa học three.js và R3F bài bản nhất | https://threejs-journey.com |
| pmndrs examples | Hàng trăm ví dụ R3F chạy được ngay | https://r3f.docs.pmnd.rs/getting-started/examples |
| The Book of Shaders | Học GLSL để viết shader foil/hologram | https://thebookofshaders.com |
| Shadertoy | Thư viện shader để tham khảo | https://www.shadertoy.com |
| GSAP Showcase | Ví dụ animation chuyên nghiệp | https://gsap.com/showcase |

## 4. UI component có hiệu ứng (copy-paste)

| Nguồn | Link |
|---|---|
| React Bits: component động (text, background, 3D) | https://reactbits.dev |
| Aceternity UI: card 3D, spotlight, parallax | https://ui.aceternity.com |
| Magic UI: hiệu ứng text, particles, border beam | https://magicui.design |
| shadcn/ui: component nền chuẩn chỉnh | https://ui.shadcn.com |
| Uiverse: nút và loader CSS | https://uiverse.io |

## 5. Font, màu, hình nền, icon

- ⭐ Google Fonts (lọc theo **Vietnamese**). https://fonts.google.com/?subset=vietnamese
- Realtime Colors: thử bảng màu trực tiếp trên layout. https://www.realtimecolors.com
- Coolors: tạo palette. https://coolors.co
- Haikei: tạo blob, wave, gradient SVG. https://haikei.app
- ⭐ Lucide: bộ icon. https://lucide.dev
- LottieFiles: animation vector (pháo hoa, mũ tốt nghiệp). https://lottiefiles.com
- Rive: animation tương tác nhẹ hơn Lottie. https://rive.app

## 6. Ảnh & âm thanh

- Squoosh: nén ảnh sang WebP/AVIF. https://squoosh.app
- rembg (offline) hoặc remove.bg: tách nền ảnh chân dung để làm hiệu ứng "chủ thể nhô khỏi bìa tạp chí". https://github.com/danielgatis/rembg
- Pixabay Music: nhạc nền miễn phí. https://pixabay.com/music
- Freesound: tiếng giấy, tiếng bẻ sáp, pháo giấy (lưu ý license). https://freesound.org

## 6b. Nguồn nhạc nền (nếu muốn thay nhạc tổng hợp)

Đã kiểm tra tháng 11/2026. **FreePD đã đóng cửa vĩnh viễn** nên không dùng được nữa.

| Nguồn | License | Ghi chú |
|---|---|---|
| ⭐ [Pixabay Music](https://pixabay.com/music/) | Pixabay Content License: dùng thương mại, **không cần ghi nguồn** | Tìm "graduation", "inspiring piano", "music box". Cần đăng nhập để tải. |
| [Incompetech (Kevin MacLeod)](https://incompetech.com/music/royalty-free/) | CC BY 4.0: **phải ghi nguồn** | Tải trực tiếp được. Hợp mood: "Heartwarming", "Wholesome", "Touching Moments". |
| [Free Music Archive](https://freemusicarchive.org) | Tuỳ từng bài (CC0 / CC BY / CC BY-NC) | Kiểm tra license của từng bài |
| [Musopen](https://musopen.org) | Phần lớn là public domain | Bản thu nhạc cổ điển (Satie *Gymnopédie*, Debussy *Clair de Lune*) |
| [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) | CC0 | 100 tiếng UI, dùng khi muốn thay hiệu ứng tổng hợp |
| [Mixkit SFX](https://mixkit.co/free-sound-effects/) | Mixkit License | Đọc kỹ điều khoản trước khi dùng |

Cách thay: chép file vào `public/audio/`, đặt `"music": "audio/<file>.mp3"` trong `src/config/event.json`. Nên dùng file khoảng 1–2 phút, nén mp3 128kbps (khoảng 1–2 MB), có điểm lặp mượt.

## 7. Deploy & kiểm thử

- GitHub Pages + Actions (mặc định của dự án). https://docs.github.com/pages
- Vercel (dự phòng). https://vercel.com
- PageSpeed Insights: đo Lighthouse trên mobile. https://pagespeed.web.dev
- opengraph.xyz: xem trước OG preview của link. https://www.opengraph.xyz

---

### Nguồn đã tham khảo khi lập danh sách
- [Three.js vs Babylon.js vs PlayCanvas (2026)](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison)
- [Best React animation libraries 2026](https://www.pkgpulse.com/guides/best-react-animation-libraries-2026)
- [Web animation tools 2026: Rive, Lottie, Spline, Motion, GSAP, Theatre](https://www.youngju.dev/blog/culture/2026-05-16-web-animation-tools-2026-rive-lottie-spline-motion-gsap-mit-anime-js-theatre-deep-dive.en)
- [pmndrs/assets](https://github.com/pmndrs/assets)
- [Where to find free game assets in 2026](https://app.cinevva.com/guides/game-assets-guide.html)
- [fasani/three-js-resources](https://awesome.ecosyste.ms/projects/github.com%2Ffasani%2Fthree-js-resources)
