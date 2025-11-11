/*
/*
  File: courses.js
  Mô tả: Render danh sách chủ đề, hỗ trợ tìm kiếm, lọc và điều hướng sang quiz tương ứng.
  Người thực hiện: Trần Thị Hoàng Nhung
  Ngày cập nhật: 9/11/2025
*/

// Định nghĩa các hằng số (constants) để ánh xạ (mapping) dữ liệu.

// Ánh xạ (mapping) key danh mục sang nhãn (label) Tiếng Việt.
const CATEGORY_LABELS = {
  food: "Ẩm thực",
  travel: "Du lịch",
  nature: "Thiên nhiên",
  business: "Kinh doanh",
  sports: "Thể thao",
  technology: "Công nghệ",
  lifestyle: "Phong cách sống",
  education: "Giáo dục",
  career: "Nghề nghiệp",
  communication: "Giao tiếp",
  health: "Sức khỏe",
  science: "Khoa học",
  culture: "Văn hóa",
  entertainment: "Giải trí",
  language: "Ngôn ngữ"
};

// Ánh xạ key độ khó sang nhãn hiển thị (dùng trên thẻ course-card).
const DIFFICULTY_LABELS = {
  basic: "Cơ bản",
  easy: "Dễ",
  hard: "Khó",
  advanced: "Nâng cao"
};

// Định nghĩa thứ tự ưu tiên (trọng số) của độ khó, dùng để sắp xếp.
const DIFFICULTY_ORDER = {
  basic: 0,
  easy: 1,
  hard: 2,
  advanced: 3
};

// Cấu hình các biến thể hình ảnh (path, size).
const IMAGE_VARIANTS = {
  food: { jpg: "images/food.jpg", webp: "images/food.webp", width: 1080, height: 720 },
  travel: { jpg: "images/travel.jpg", webp: "images/travel.webp", width: 1280, height: 720 },
  animals: { jpg: "images/animals.jpg", webp: "images/animals.webp", width: 1280, height: 720 },
  business: { jpg: "images/business.jpg", webp: "images/business.webp", width: 1280, height: 670 },
  sport: { jpg: "images/sport.jpg", webp: "images/sport.webp", width: 1280, height: 720 },
  tech: { jpg: "images/tech.jpg", webp: "images/tech.webp", width: 1019, height: 720 }
};

// Ánh xạ category của khóa học sang biến thể hình ảnh tương ứng.
const CATEGORY_IMAGE_VARIANTS = {
  food: IMAGE_VARIANTS.food,
  travel: IMAGE_VARIANTS.travel,
  nature: IMAGE_VARIANTS.animals,
  business: IMAGE_VARIANTS.business,
  sports: IMAGE_VARIANTS.sport,
  technology: IMAGE_VARIANTS.tech,
  lifestyle: IMAGE_VARIANTS.food,
  education: IMAGE_VARIANTS.business,
  career: IMAGE_VARIANTS.business,
  communication: IMAGE_VARIANTS.business,
  health: IMAGE_VARIANTS.sport,
  science: IMAGE_VARIANTS.tech,
  culture: IMAGE_VARIANTS.animals,
  entertainment: IMAGE_VARIANTS.animals,
  language: IMAGE_VARIANTS.food,
  default: IMAGE_VARIANTS.tech // Hình ảnh dự phòng.
};

// Dữ liệu thô (nguồn) của tất cả các chủ đề/khóa học.
const rawCourses = [
  {
    id: "food",
    title: "Đồ ăn & Thức uống",
    description: "Học từ vựng về đồ ăn, thức uống và nhà hàng",
    category: "food",
    difficulty: "basic",
    available: true
  },
  {
    id: "travel",
    title: "Du lịch",
    description: "Giao tiếp khi đi du lịch, đặt phòng và hỏi đường",
    category: "travel",
    difficulty: "easy",
    available: true
  },
  {
    id: "animals",
    title: "Động vật",
    description: "Từ vựng về các loài động vật và môi trường sống",
    category: "nature",
    difficulty: "easy",
    available: true
  },
  {
    id: "business",
    title: "Kinh doanh",
    description: "Tiếng&nbsp;Anh chuyên ngành văn phòng và kinh doanh",
    category: "business",
    difficulty: "hard",
    available: true
  },
  {
    id: "sports",
    title: "Thể thao",
    description: "Học từ vựng về các môn thể thao và hoạt động",
    category: "sports",
    difficulty: "easy",
    available: true
  },
  {
    id: "tech",
    title: "Công nghệ",
    description: "Từ vựng công nghệ và thiết bị điện tử",
    category: "technology",
    difficulty: "advanced",
    available: true
  },
  {
    id: "daily-life",
    title: "Sinh hoạt hằng ngày",
    description: "Từ vựng giao tiếp trong gia đình, bạn bè và sinh hoạt thường nhật",
    category: "lifestyle",
    difficulty: "basic",
    available: false
  },
  {
    id: "shopping",
    title: "Mua sắm & Thương mại",
    description: "Từ vựng và mẫu câu khi mua sắm, mặc cả và thanh toán",
    category: "lifestyle",
    difficulty: "easy",
    available: false
  },
  {
    id: "school-life",
    title: "Đời sống học đường",
    description: "Giao tiếp trong lớp học, câu lạc bộ và hoạt động ngoại khóa",
    category: "education",
    difficulty: "basic",
    available: false
  },
  {
    id: "exams",
    title: "Ôn thi & Kiểm tra",
    description: "Thuật ngữ và mẹo khi làm bài kiểm tra, thi cử tiếng&nbsp;Anh",
    category: "education",
    difficulty: "hard",
    available: false
  },
  {
    id: "jobs",
    title: "Tìm việc làm",
    description: "Từ vựng cho CV, tìm việc và trao đổi với nhà tuyển dụng",
    category: "career",
    difficulty: "easy",
    available: false
  },
  {
    id: "interviews",
    title: "Phỏng vấn xin việc",
    description: "Luyện tập câu hỏi phỏng vấn và cách trả lời tự tin",
    category: "career",
    difficulty: "hard",
    available: false
  },
  {
    id: "emails",
    title: "Email chuyên nghiệp",
    description: "Cấu trúc và cụm từ thông dụng trong email công sở",
    category: "communication",
    difficulty: "easy",
    available: false
  },
  {
    id: "presentations",
    title: "Thuyết trình",
    description: "Ngôn ngữ trình bày, dẫn dắt và kết thúc bài thuyết trình",
    category: "communication",
    difficulty: "hard",
    available: false
  },
  {
    id: "customer-service",
    title: "Chăm sóc khách hàng",
    description: "Cách xử lý tình huống và phản hồi khách hàng bằng tiếng&nbsp;Anh",
    category: "business",
    difficulty: "easy",
    available: false
  },
  {
    id: "finance",
    title: "Tài chính cá nhân",
    description: "Thuật ngữ tài chính, ngân hàng và đầu tư cơ bản",
    category: "business",
    difficulty: "hard",
    available: false
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Từ vựng về quảng cáo, chiến dịch và nghiên cứu thị trường",
    category: "business",
    difficulty: "easy",
    available: false
  },
  {
    id: "startups",
    title: "Khởi nghiệp",
    description: "Giao tiếp khi gọi vốn, trình bày ý tưởng và phát triển sản phẩm",
    category: "business",
    difficulty: "advanced",
    available: false
  },
  {
    id: "healthcare",
    title: "Chăm sóc sức khỏe",
    description: "Thuật ngữ y tế cơ bản cho việc đi khám và tư vấn sức khỏe",
    category: "health",
    difficulty: "basic",
    available: false
  },
  {
    id: "fitness",
    title: "Thể hình & Gym",
    description: "Ngôn ngữ cho luyện tập, chế độ thể thao và dinh dưỡng",
    category: "health",
    difficulty: "easy",
    available: false
  },
  {
    id: "nutrition",
    title: "Dinh dưỡng lành mạnh",
    description: "Từ vựng về chế độ ăn uống và lời khuyên về sức khỏe",
    category: "health",
    difficulty: "easy",
    available: false
  },
  {
    id: "environment",
    title: "Môi trường",
    description: "Thuật ngữ về biến đổi khí hậu và bảo vệ môi trường",
    category: "nature",
    difficulty: "hard",
    available: false
  },
  {
    id: "weather",
    title: "Thời tiết",
    description: "Mô tả thời tiết, hiện tượng tự nhiên và dự báo",
    category: "nature",
    difficulty: "basic",
    available: false
  },
  {
    id: "wildlife-conservation",
    title: "Bảo tồn thiên nhiên",
    description: "Từ vựng về động vật hoang dã và dự án bảo tồn",
    category: "nature",
    difficulty: "advanced",
    available: false
  },
  {
    id: "science",
    title: "Khoa học thường thức",
    description: "Khám phá hiện tượng khoa học thú vị trong đời sống",
    category: "science",
    difficulty: "basic",
    available: false
  },
  {
    id: "space",
    title: "Không gian vũ trụ",
    description: "Từ vựng về vũ trụ, hành tinh và khám phá không gian",
    category: "science",
    difficulty: "advanced",
    available: false
  },
  {
    id: "technology-trends",
    title: "Xu hướng công nghệ",
    description: "Thuật ngữ về AI, IoT và các công nghệ nổi bật",
    category: "technology",
    difficulty: "advanced",
    available: false
  },
  {
    id: "programming",
    title: "Lập trình",
    description: "Từ vựng cho lập trình viên và dự án phần mềm",
    category: "technology",
    difficulty: "hard",
    available: false
  },
  {
    id: "smart-home",
    title: "Nhà thông minh",
    description: "Thiết bị IoT trong gia đình và cách vận hành",
    category: "technology",
    difficulty: "easy",
    available: false
  },
  {
    id: "art",
    title: "Nghệ thuật & Sáng tạo",
    description: "Từ vựng về hội họa, thiết kế và nghệ thuật đương đại",
    category: "culture",
    difficulty: "basic",
    available: false
  },
  {
    id: "music",
    title: "Âm nhạc",
    description: "Thuật ngữ âm nhạc, nhạc cụ và thể loại phổ biến",
    category: "culture",
    difficulty: "easy",
    available: false
  },
  {
    id: "movies",
    title: "Điện ảnh",
    description: "Giao tiếp về phim ảnh, diễn viên và đánh giá phim",
    category: "entertainment",
    difficulty: "easy",
    available: false
  },
  {
    id: "books",
    title: "Sách & Văn học",
    description: "Thảo luận về tác phẩm, tác giả và thể loại sách",
    category: "culture",
    difficulty: "hard",
    available: false
  },
  {
    id: "news",
    title: "Tin tức & Truyền thông",
    description: "Thuật ngữ báo chí, phỏng vấn và bản tin thời sự",
    category: "communication",
    difficulty: "hard",
    available: false
  },
  {
    id: "tourism-industry",
    title: "Ngành du lịch",
    description: "Giao tiếp cho hướng dẫn viên, khách sạn và tour",
    category: "travel",
    difficulty: "easy",
    available: false
  },
  {
    id: "adventure-travel",
    title: "Du lịch mạo hiểm",
    description: "Từ vựng dành cho trekking, leo núi và khám phá",
    category: "travel",
    difficulty: "advanced",
    available: false
  },
  {
    id: "academic-writing",
    title: "Viết học thuật",
    description: "Cấu trúc bài luận, báo cáo và nghiên cứu bằng tiếng&nbsp;Anh",
    category: "education",
    difficulty: "advanced",
    available: false
  },
  {
    id: "grammar",
    title: "Ngữ pháp nâng cao",
    description: "Ôn tập cấu trúc câu phức và điểm ngữ pháp thường gặp",
    category: "education",
    difficulty: "hard",
    available: false
  },
  {
    id: "idioms",
    title: "Thành ngữ",
    description: "Thành ngữ tiếng&nbsp;Anh phổ biến trong giao tiếp hằng ngày",
    category: "language",
    difficulty: "hard",
    available: false
  },
  {
    id: "phrasal-verbs",
    title: "Cụm động từ",
    description: "Luyện các cụm động từ thông dụng và cách sử dụng",
    category: "language",
    difficulty: "advanced",
    available: false
  }
];

// Xử lý dữ liệu thô: Thêm thông tin 'imageVariant' vào mỗi khóa học.
const courseCatalog = rawCourses.map((course) => ({
  ...course,
  imageVariant: CATEGORY_IMAGE_VARIANTS[course.category] || CATEGORY_IMAGE_VARIANTS.default
}));

// Đối tượng state TỐI GIẢN - chỉ đủ để chạy sort mặc định
const filters = {
  sort: "default",
  // Các bộ lọc khác sẽ được thêm ở commit ngày 11/11
};

// Cache (lưu trữ) các tham chiếu đến phần tử DOM quan trọng.
const courseGrid = document.getElementById("courseGrid");
// Các DOM element cho filter sẽ được thêm ở commit ngày 11/11

// Điểm bắt đầu: Chạy 'initCoursePage' khi DOM đã tải xong.
document.addEventListener("DOMContentLoaded", initCoursePage);

// Hàm khởi tạo chính: Chỉ chạy 'applyFilters' lần đầu.
function initCoursePage() {
  if (!courseGrid) {
    return;
  }
  // Các hàm khởi tạo filter sẽ được thêm ở commit ngày 11/11
  applyFilters();
}

// Hàm trung tâm: Chỉ Sắp xếp và Render.
function applyFilters() {
  // Logic lọc sẽ được thêm ở commit ngày 11/11
  
  // 2. Sắp xếp
  const sortedCourses = sortCourses(courseCatalog); // Tạm thời dùng toàn bộ catalog

  // 3. Render
  renderCourseCatalog(sortedCourses);
  
  // Các hàm cập nhật UI filter sẽ được thêm ở commit ngày 11/11
}

// Các hàm 'matches...' (logic lọc) sẽ được thêm ở commit ngày 11/11


// Sắp xếp mảng khóa học (CHỈ GIỮ LẠI TRƯỜNG HỢP DEFAULT)
function sortCourses(courses) {
  const sorted = [...courses];

  switch (filters.sort) {
    case "default":
      sorted.sort(compareAvailableAlphabetical);
      break;
    // Các case sắp xếp khác sẽ được thêm ở commit ngày 11/11
    default:
      sorted.sort(compareAvailableAlphabetical); // Luôn sort mặc định
      break;
  }

  return sorted;
}

// Hàm so sánh (sắp xếp) theo tiêu đề A-Z (hỗ trợ Tiếng Việt).
function compareTitleAscending(a, b) {
  return a.title.localeCompare(b.title, "vi", { sensitivity: "base" });
}

// Hàm so sánh mặc định: Ưu tiên 'available' (có sẵn) lên đầu, sau đó A-Z.
function compareAvailableAlphabetical(a, b) {
  if (a.available !== b.available) {
    return a.available ? -1 : 1;
  }
  return compareTitleAscending(a, b);
}

// Hàm so sánh theo điểm sẽ được thêm ở commit ngày 11/11

// Lấy điểm cao nhất (best score) của khóa học từ localStorage.
function getBestScore(course) {
  if (!course.available) {
    return 0;
  }

  return Number(localStorage.getItem(`bestScore_${course.id}`) || 0);
}

// Render (vẽ) danh sách các thẻ (card) khóa học vào 'courseGrid'.
function renderCourseCatalog(courses) {
  if (!courseGrid) {
    return;
  }

  courseGrid.innerHTML = "";

  courseGrid.classList.remove("reveal");
  courseGrid.classList.remove("reveal--visible");

  // Xử lý trạng thái rỗng
  if (!courses.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "course-empty";
    emptyState.textContent =
      "Không tìm thấy chủ đề phù hợp."; // Tạm thời
    courseGrid.append(emptyState);
    return;
  }

  // Render các thẻ
  courses.forEach((course) => {
    const courseCard = document.createElement("article");
    courseCard.className = "course-card";
    courseCard.dataset.courseId = course.id;
    courseCard.dataset.category = course.category;

    // Chuẩn bị dữ liệu cho template
    const categoryLabel = formatCategoryLabel(course.category);
    const bestScore = getBestScore(course);
    const availabilityBadgeClass = course.available
      ? "course-card__badge"
      : "course-card__badge course-card__badge--upcoming";
    const availabilityLabel = course.available ? "Có sẵn" : "Sắp ra mắt";
    const difficultyLabel = DIFFICULTY_LABELS[course.difficulty] || "Không xác định";
    const imageVariant = course.imageVariant || CATEGORY_IMAGE_VARIANTS.default;
    const { jpg: imageJpg, webp: imageWebp, width: imageWidth, height: imageHeight } = imageVariant;

    // Tạo cấu trúc HTML cho một course-card.
    courseCard.innerHTML = `
      <div class="course-card__thumb">
        <picture class="course-card__media" aria-hidden="true">
          <source srcset="${imageWebp}" type="image/webp" />
          <img src="${imageJpg}" alt="" loading="lazy" width="${imageWidth}" height="${imageHeight}" />
        </picture>
      </div>
      <div class="course-card__body">
        <div class="course-card__meta">
          <span class="course-card__category">${categoryLabel}</span>
          <span class="course-card__badge course-card__badge--difficulty">${difficultyLabel}</span>
          <span class="${availabilityBadgeClass}">${availabilityLabel}</span>
        </div>
        <h3 class="course-card__title">${course.title}</h3>
        <p class="course-card__description">${course.description}</p>
        <div class="course-card__footer">
          ${
          // Hiển thị điểm/ghi chú dựa trên trạng thái 'available'.
          course.available
            ? `<p class="course-card__best-score">Điểm cao nhất: ${bestScore}/100</p>`
            : `<p class="course-card__note">Nội dung sẽ được cập nhật sớm.</p>`
        }
        ${
          // Hiển thị nút 'Làm quiz' nếu 'available'.
          course.available
            ? `<div class="course-card__actions">
                 <button class="course-card__btn" type="button" data-quiz-id="${course.id}">
                   Làm quiz <span class="course-card__btn-icon" aria-hidden="true">➜</span>
                 </button>
               </div>`
            : ""
        }
        </div>
      </div>
    `;

    // Gán sự kiện click/keydown (Enter/Space) cho các thẻ 'available' để điều hướng.
    if (course.available) {
      courseCard.tabIndex = 0;
      courseCard.setAttribute("role", "button");
      courseCard.addEventListener("click", () => {
        redirectToQuiz(course.id);
      });
      courseCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          redirectToQuiz(course.id);
        }
      });

      // Gán sự kiện click riêng cho nút 'Làm quiz' (ngăn chặn stopPropagation).
      const startQuizButton = courseCard.querySelector(".course-card__btn");
      if (startQuizButton) {
        startQuizButton.addEventListener("click", (event) => {
          event.stopPropagation();
          redirectToQuiz(course.id);
        });
      }
    } else {
      // Vô hiệu hóa (inactive) các thẻ 'upcoming' (sắp ra mắt).
      courseCard.classList.add("course-card--inactive");
      courseCard.setAttribute("aria-disabled", "true");
      courseCard.tabIndex = -1;
    }

    courseGrid.append(courseCard);
  });

  // Kích hoạt sự kiện 'scroll' (hỗ trợ lazy loading hoặc hiệu ứng animation).
  window.dispatchEvent(new Event("scroll"));
}

// Điều hướng trang sang 'quiz.html' với tham số (query param) 'topicId'.
function redirectToQuiz(topicId) {
  window.location.href = `quiz.html?topic=${topicId}`;
}

// Hàm updateResultsSummary sẽ được thêm ở commit ngày 11/11


// Tiện ích: Chuyển key (vd: 'food') thành nhãn (vd: 'Ẩm thực') từ hằng số. Có fallback.
function formatCategoryLabel(categoryKey) {
  const fallback = categoryKey
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
  return CATEGORY_LABELS[categoryKey] || fallback;
}

// Hàm normalizeText (cho search) sẽ được thêm ở commit ngày 11/11