# Learnie – IE104 Web Project

Learnie là website luyện tiếng Anh theo chủ đề được phát triển cho môn **IE104 – Internet & Công nghệ Web** (UIT). Ứng dụng chạy hoàn toàn offline bằng **HTML5 + CSS3 + JavaScript thuần**, không dùng framework hay thư viện ngoài nhằm đáp ứng 100% tiêu chí của môn học.

> [!TIP]
> **Trải nghiệm thông qua: [Demo - Learnie](https://phuongnga205.github.io/IE104-Group1-StudyApp/)**

## 1. Mục tiêu & Phạm vi
- Mang lại trải nghiệm tự học tiếng Anh qua quiz theo chủ đề quen thuộc (Ẩm thực, Du lịch, Công nghệ…).
- Cung cấp hệ thống bộ lọc khóa học, quiz tính điểm, form liên hệ và dark mode phù hợp với rubric IE104.
- Toàn bộ dữ liệu (điểm, chủ đề đã xem, liên hệ) lưu trong `localStorage` để tiện chấm offline.

## 2. Kiến trúc & Công nghệ
| Thành phần | Mô tả |
|------------|------|
| HTML5      | Tổ chức trang theo semantic layout (header/nav/main/section/footer). |
| CSS3       | Chia theo từng trang + `base.css`, sử dụng biến CSS, Flexbox/Grid, media queries 640/768/900/1024px. |
| JavaScript | Mỗi trang tương tác có file riêng cùng header comment; sử dụng IIFE/module pattern đơn giản, `addEventListener`, không globals. |
| Storage    | `localStorage` dùng cho theme, điểm quiz (`bestScore_*`) và form liên hệ (`learnie.contacts`). |

### Quyết định kỹ thuật
- **Không dùng framework** để bảo toàn yêu cầu IE104 và giảm phụ thuộc khi chạy file://.
- **Dữ liệu tĩnh**: Câu hỏi quiz và danh sách khóa học hard-code trong JS để tránh fetch, đồng thời dễ chỉnh sửa khi chấm bài.
- **Hỗ trợ a11y**: Dark mode có `aria-pressed`, slider điểm có trạng thái hiển thị rõ, nav dùng `aria-label`.

## 3. Cấu trúc thư mục
```
Learnie/
├── index.html        # Trang chủ
├── courses.html      # Danh sách khóa học + bộ lọc
├── quiz.html         # Làm quiz theo chủ đề (?topic=...)
├── contact.html      # Trang liên hệ
├── about.html        # Trang giới thiệu nhóm
├── css/
│   ├── base.css          # Layout chung, typography, header/footer
│   ├── animation.css     # Hiệu ứng reveal, transition
│   ├── home.css          # Phần hero/topic của trang chủ
│   ├── courses.css       # Bộ lọc, card khóa học, slider điểm
│   ├── quiz.css          # UI quiz + bảng kết quả
│   ├── contact.css       # Form, sidebar bản đồ
│   └── about.css         # Story, team section
├── js/
│   ├── main.js           # Dark mode + scroll reveal + carousel
│   ├── courses.js        # Dữ liệu chủ đề, bộ lọc, multi-select, slider
│   ├── quiz.js           # Ngân hàng câu hỏi, tính điểm, localStorage
│   └── contact.js        # Validate + lưu contact giả lập
├── images/               # Ảnh minh họa (có bản WebP)
├── audio/                # Âm thanh quiz (đúng/sai/hoàn thành)
└── README.md
```

## 4. Tính năng nổi bật
- 🌙 **Dark Mode**: Toggle lưu trạng thái vào `localStorage`, đồng bộ `aria-pressed`.
- 📚 **Danh sách khóa học**: 40 chủ đề, 6 chủ đề có nội dung; bộ lọc đa lựa chọn theo danh mục, trình độ, trạng thái, khoảng điểm.
- 🧠 **Bộ lọc nâng cao**: Custom multi-select + slider 2 đầu (0–100) cho phép kết hợp nhiều điều kiện cùng lúc mà không dùng thư viện ngoài.
- 🎯 **Quiz**: Mỗi chủ đề có 5 câu (3 trắc nghiệm + 2 điền từ); tính điểm 100 cho mọi số câu, hiển thị kết quả mới + điểm cao nhất.
- 🏅 **Lưu điểm cá nhân**: `localStorage` ghi lại best score per topic (`bestScore_<topicId>`), hiển thị ngay trên thẻ khóa học.
- 📩 **Form liên hệ**: Kiểm tra tên/email/nội dung, lưu bản ghi vào `learnie.contacts` cho mục đích demo.
- ♿ **A11y cơ bản**: Heading rõ ràng, focus ring cho button/link, slider có nhãn động, nav dùng `aria-label`.
- 📱 **Responsive**: Thiết kế tối ưu cho mobile ≥360px, tablet và desktop; dùng CSS variable + media query.

## 5. Quy ước đặt tên & format
- **HTML/CSS**: class theo BEM/kebab (`course-card__title`, `quiz-option-btn--correct`), file dùng kebab-case.
- **JavaScript**: camelCase cho biến/hàm, hằng số UPPER_SNAKE_CASE (`MAX_SCORE`, `THEME_STORAGE_KEY`). Hàm đặt tên dạng động từ + bổ ngữ (`renderCourseCatalog`, `handleScoreRangeChange`).
- **Comment**: Header ở mỗi CSS/JS mô tả mục đích + người phụ trách; chèn inline comment khi logic khó hiểu.
- **Lint thủ công**: giữ indent 2 spaces (HTML/CSS) và 2 spaces (JS), không trailing whitespace, dòng ≤120 ký tự.

## 6. Hướng dẫn chạy & kiểm tra
1. Bật trình duyệt hiện đại (Chrome ≥ 110, Edge, Firefox) và mở file `index.html` bằng `file://` (không cần server).
2. Đi qua flow đề xuất: `Trang chủ → Khóa học → chọn chủ đề (Food) → Làm quiz → Quay về Khóa học → Liên hệ → Giới thiệu`.
3. Kiểm tra dark mode, bộ lọc đa lựa chọn và slider điểm ở trang Khóa học.
4. Nếu muốn reset dữ liệu demo, mở DevTools → `localStorage.clear()`.

### Kiểm thử thủ công
- Desktop 1440px & 1024px; Tablet 768px; Mobile 414px.
- Dùng bàn phím Tab/Shift+Tab để đảm bảo focus ở nav, button, multi-select.
- Dùng combo phím `Enter/Space` trong quiz để kiểm tra phím tắt.

## 7. Dữ liệu & lưu trữ
- **Khoá học**: danh sách 40 entry trong `js/courses.js` (6 có sẵn, còn lại `available: false`).
- **Quiz bank**: đối tượng `quizBank` trong `js/quiz.js` – mỗi chủ đề 5 câu, đáp án & giải thích tiếng Anh/VN.
- **LocalStorage keys**:
  - `learnie.theme`: trạng thái dark/light.
  - `bestScore_<topicId>`: điểm cao nhất theo chủ đề.
  - `learnie.contacts`: mảng JSON thông tin liên hệ demo.

## 8. Định hướng phát triển
- Tách dữ liệu khóa học & quiz sang JSON để dễ cập nhật.
- Bổ sung CHANGELOG + ADR ngắn cho các quyết định kỹ thuật.
- Viết unit test nhẹ cho logic quiz và bộ lọc (nếu được phép dùng tooling).

## 9. Thành viên nhóm
| STT | Họ và tên | MSSV |
|-----|-----------|------|
| 1 | Lê Ngọc Phương Nga | 23520992 |
| 2 | Trần Thị Hoàng Nhung | 23521131 |
| 3 | Nguyễn Đặng Quang Phúc | 23521204 |

> *Mọi câu hỏi liên hệ qua `contact@learnie.vn` hoặc form Liên hệ trong dự án. *
