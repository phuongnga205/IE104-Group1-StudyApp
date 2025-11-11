# IE104-Group1-StudyApp
# Learnie – IE104 Web Project

Learnie là website luyện tiếng Anh theo chủ đề được phát triển cho môn **IE104 – Internet & Công nghệ Web** (UIT). Ứng dụng chạy hoàn toàn offline bằng **HTML5 + CSS3 + JavaScript thuần**, không dùng framework hay thư viện ngoài nhằm đáp ứng 100% tiêu chí của môn học.

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
