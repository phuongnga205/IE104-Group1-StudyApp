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

// Danh sách từ khóa gợi ý tìm kiếm nhanh.
const QUICK_KEYWORDS = [
  "Du lịch",
  "Đồ ăn",
  "Kinh doanh",
  "Công nghệ",
  "Sức khỏe",
  "Thành ngữ",
  "Thời tiết",
  "Thể thao"
];

// Nhãn hiển thị cho các tùy chọn sắp xếp trong dropdown.
const SORT_LABELS = {
  default: "Sắp\u00A0xếp",
  "difficulty-asc": "Dễ → Khó",
  "difficulty-desc": "Khó → Dễ",
  "title-asc": "Tên A → Z",
  "title-desc": "Tên Z → A",
  "score-asc": "Điểm\u00A0thấp → cao",
  "score-desc": "Điểm\u00A0cao → thấp"
};

// Giá trị sắp xếp mặc định khi tải trang.
const DEFAULT_SORT_OPTION = "default";

// Nhãn hiển thị chi tiết (Anh/Việt) cho bộ lọc MultiSelect trình độ.
const DIFFICULTY_MULTI_LABELS = {
  basic: "Beginner / Cơ bản",
  easy: "Elementary / Dễ",
  hard: "Intermediate / Khó",
  advanced: "Advanced / Nâng cao"
};

// Nhãn hiển thị cho bộ lọc trạng thái.
const STATUS_LABELS = {
  available: "Có\u00A0nội\u00A0dung",
  upcoming: "Sắp\u00A0ra\u00A0mắt"
};

// Cấu hình giá trị min, max và bước nhảy cho thanh trượt (slider) lọc điểm.
const SCORE_MIN = 0;
const SCORE_MAX = 100;
const SCORE_STEP = 5;

// Registry (bộ đệm) lưu tất cả instance của MultiSelect.
// Dùng để đóng các dropdown khác khi mở một.
const multiSelectRegistry = [];

/**
 * Component Dropdown Đa lựa chọn (MultiSelect) tùy chỉnh.
 * Quản lý trạng thái, render options, xử lý sự kiện (click, bàn phím, click-outside).
 */
class MultiSelect {
  // Khởi tạo MultiSelect. Gán các phần tử DOM, cấu hình và sự kiện.
  constructor(rootElement, { placeholder, options = [], onChange } = {}) {
    // Lưu trữ các phần tử DOM và trạng thái nội bộ.
    this.root = rootElement;
    this.placeholder = placeholder;
    this.options = options;
    this.onChange = onChange; // Callback khi giá trị thay đổi.
    this.trigger = this.root?.querySelector(".multi-select__trigger"); // Nút mở/đóng.
    this.panel = this.root?.querySelector(".multi-select__panel"); // Panel chứa options.
    this.optionButtons = []; // Mảng chứa các DOM element của options.
    this.selectedValues = new Set(); // Set lưu các giá trị đã chọn.
    this.focusIndex = -1; // Vị trí option đang focus (hỗ trợ bàn phím).
    this.isOpen = false; // Trạng thái đóng/mở.

    // Kiểm tra các phần tử DOM thiết yếu.
    if (!this.root || !this.trigger || !this.panel) {
      return;
    }

    // Khởi tạo và gán sự kiện.
    this.renderOptions();
    this.bindEvents();
    this.updateTriggerLabel();
    multiSelectRegistry.push(this); // Thêm vào registry để quản lý.
  }

  // Render (vẽ) các tùy chọn (options) vào panel dựa trên mảng 'this.options'.
  renderOptions() {
    this.panel.innerHTML = "";
    this.optionButtons = [];
    this.options.forEach((option, index) => {
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "multi-select__option";
      optionButton.dataset.value = option.value;
      optionButton.textContent = option.label;
      optionButton.setAttribute("role", "option");
      optionButton.setAttribute("aria-selected", "false");
      optionButton.tabIndex = -1; // Không tab-indexed, chỉ focus bằng code/mũi tên.
      // Sự kiện click chọn/bỏ chọn.
      optionButton.addEventListener("click", () => {
        this.toggleValue(option.value);
      });
      // Sự kiện bàn phím trên option.
      optionButton.addEventListener("keydown", (event) => {
        this.handleOptionKeydown(event, index);
      });
      this.panel.append(optionButton);
      this.optionButtons.push(optionButton);
    });
  }

  // Gán các sự kiện chính cho trigger (click, keydown) và sự kiện click-outside.
  bindEvents() {
    // Xử lý click: Mở/đóng panel.
    this.trigger.addEventListener("click", () => {
      this.isOpen ? this.close() : this.open();
    });

    // Xử lý bàn phím trên trigger: Mũi tên, Enter/Space (mở/đóng), Escape (đóng).
    this.trigger.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        this.open();
        const targetIndex = event.key === "ArrowDown" ? 0 : this.optionButtons.length - 1;
        this.focusOption(targetIndex);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.isOpen ? this.close() : this.open();
      } else if (event.key === "Escape" && this.isOpen) {
        event.preventDefault();
        event.stopPropagation();
        this.close();
      }
    });

    // Xử lý click-outside: Đóng panel nếu click ra ngoài component.
    document.addEventListener("mousedown", (event) => {
      if (this.isOpen && this.root && !this.root.contains(event.target)) {
        this.close();
      }
    });
  }

  // Xử lý điều hướng bàn phím (Mũi tên, Home, End, Escape, Enter/Space) bên trong panel options.
  handleOptionKeydown(event, index) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.focusOption(Math.min(this.optionButtons.length - 1, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        this.focusOption(Math.max(0, index - 1));
        break;
      case "Home":
        event.preventDefault();
        this.focusOption(0);
        break;
      case "End":
        event.preventDefault();
        this.focusOption(this.optionButtons.length - 1);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        this.close();
        this.trigger.focus();
        break;
      case " " :
      case "Enter":
        event.preventDefault();
        this.toggleValue(this.optionButtons[index].dataset.value);
        break;
      default:
        break;
    }
  }

  // Di chuyển focus đến một option cụ thể theo index.
  focusOption(index) {
    if (index < 0 || index >= this.optionButtons.length) {
      return;
    }
    this.focusIndex = index;
    const target = this.optionButtons[index];
    target.focus();
  }

  // Mở panel dropdown. Đóng các instance khác (lấy từ registry).
  open() {
    closeOtherMultiSelects(this);
    this.panel.removeAttribute("hidden");
    this.trigger.setAttribute("aria-expanded", "true");
    this.isOpen = true;
  }

  // Đóng panel dropdown và cập nhật thuộc tính ARIA.
  close() {
    if (!this.isOpen) {
      return;
    }
    if (!this.panel.hasAttribute("hidden")) {
      this.panel.setAttribute("hidden", "");
    }
    this.trigger.setAttribute("aria-expanded", "false");
    this.isOpen = false;
    this.focusIndex = -1;
  }

  // Chọn hoặc bỏ chọn một giá trị. Cập nhật UI và kích hoạt 'onChange'.
  toggleValue(value) {
    if (this.selectedValues.has(value)) {
      this.selectedValues.delete(value);
    } else {
      this.selectedValues.add(value);
    }
    this.updateOptionStates();
    this.updateTriggerLabel();
    this.emitChange();
  }

  // Cập nhật class 'is-selected' và ARIA 'aria-selected' cho các options.
  updateOptionStates() {
    this.optionButtons.forEach((button) => {
      const isSelected = this.selectedValues.has(button.dataset.value);
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-selected", String(isSelected));
    });
  }

  // Cập nhật text hiển thị trên trigger (Placeholder, 'Đã chọn X', hoặc danh sách label).
  updateTriggerLabel() {
    const values = Array.from(this.selectedValues);
    if (values.length === 0) {
      this.trigger.textContent = this.placeholder;
      return;
    }

    if (values.length <= 2) {
      const labels = values
        .map((value) => this.getLabelByValue(value))
        .filter(Boolean)
        .join(", ");
      this.trigger.textContent = labels;
      return;
    }

    this.trigger.textContent = `Đã chọn ${values.length}`;
  }

  // Tiện ích: Lấy nhãn (label) hiển thị từ giá trị (value).
  getLabelByValue(value) {
    const option = this.options.find((item) => item.value === value);
    return option ? option.label : value;
  }

  // Kích hoạt (emit) callback 'onChange' với các giá trị đã chọn.
  emitChange() {
    if (typeof this.onChange === "function") {
      this.onChange(this.getValues());
    }
  }

  // Trả về mảng các giá trị (values) đã chọn.
  getValues() {
    return Array.from(this.selectedValues);
  }

  // Gán giá trị cho component (thường dùng khi reset).
  // Tùy chọn 'silent' để không emit 'onChange'.
  setValues(values = [], { silent = false } = {}) {
    this.selectedValues = new Set(values);
    this.updateOptionStates();
    this.updateTriggerLabel();
    if (!silent) {
      this.emitChange();
    }
  }

  // Xóa tất cả các lựa chọn.
  clear({ silent = false } = {}) {
    this.setValues([], { silent });
    this.close();
  }
}

// Đóng tất cả các instance MultiSelect khác (lấy từ registry) trừ instance hiện tại.
function closeOtherMultiSelects(currentInstance) {
  multiSelectRegistry.forEach((instance) => {
    if (instance !== currentInstance) {
      instance.close();
    }
  });
}

// Hàm factory: Tìm DOM element và tạo instance MultiSelect mới.
function createMultiSelectInstance(elementId, config) {
  const root = document.getElementById(elementId);
  if (!root) {
    return null;
  }
  return new MultiSelect(root, config);
}

// Lấy danh sách options (đã sắp xếp) cho bộ lọc Danh mục từ 'courseCatalog'.
function getCategoryOptions() {
  const uniqueCategories = Array.from(
    new Set(courseCatalog.map((course) => course.category))
  ).sort((a, b) =>
    formatCategoryLabel(a).localeCompare(formatCategoryLabel(b), "vi", { sensitivity: "base" })
  );

  return uniqueCategories.map((categoryKey) => ({
    value: categoryKey,
    label: formatCategoryLabel(categoryKey)
  }));
}

// Lấy danh sách options cho bộ lọc Trình độ từ hằng số.
function getDifficultyOptions() {
  return Object.keys(DIFFICULTY_MULTI_LABELS).map((key) => ({
    value: key,
    label: DIFFICULTY_MULTI_LABELS[key]
  }));
}

// Lấy danh sách options cho bộ lọc Trạng thái từ hằng số.
function getStatusOptions() {
  return Object.keys(STATUS_LABELS).map((key) => ({
    value: key,
    label: STATUS_LABELS[key]
  }));
}

// Khởi tạo 3 instance MultiSelect (Danh mục, Trình độ, Trạng thái) và gán sự kiện 'onChange'.
function initializeMultiSelects() {
  // Instance lọc Danh mục.
  categoryMultiSelect = createMultiSelectInstance("courseCategoryMulti", {
    placeholder: "Tất\u00A0cả Danh\u00A0mục",
    options: getCategoryOptions(),
    onChange: (selectedValues) => {
      filters.category = selectedValues;
      applyFilters();
    }
  });

  // Instance lọc Trình độ.
  difficultyMultiSelect = createMultiSelectInstance("courseDifficultyMulti", {
    placeholder: "Tất\u00A0cả Trình\u00A0độ",
    options: getDifficultyOptions(),
    onChange: (selectedValues) => {
      filters.difficulty = selectedValues;
      applyFilters();
    }
  });

  // Instance lọc Trạng thái.
  statusMultiSelect = createMultiSelectInstance("courseStatusMulti", {
    placeholder: "Tất\u00A0cả Chủ\u00A0đề",
    options: getStatusOptions(),
    onChange: (selectedValues) => {
      filters.status = selectedValues;
      applyFilters();
    }
  });
}

// Tiện ích: Đóng tất cả các MultiSelect (dùng khi đóng panel filter).
function closeAllMultiSelects() {
  [categoryMultiSelect, difficultyMultiSelect, statusMultiSelect]
    .filter(Boolean)
    .forEach((instance) => instance.close());
}

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
// Đây là nguồn dữ liệu chính để lọc/render.
const courseCatalog = rawCourses.map((course) => ({
  ...course,
  imageVariant: CATEGORY_IMAGE_VARIANTS[course.category] || CATEGORY_IMAGE_VARIANTS.default
}));

// Đối tượng (state) lưu trữ trạng thái hiện tại của tất cả bộ lọc. (Single Source of Truth)
const filters = {
  search: "",
  category: [],
  difficulty: [],
  status: [],
  scoreRange: { min: SCORE_MIN, max: SCORE_MAX },
  sort: DEFAULT_SORT_OPTION
};

// Cache (lưu trữ) các tham chiếu đến phần tử DOM quan trọng.
const courseGrid = document.getElementById("courseGrid");
const filtersForm = document.getElementById("courseFilters");
const searchInput = document.getElementById("courseSearch");
const scoreMinInput = document.getElementById("scoreMin");
const scoreMaxInput = document.getElementById("scoreMax");
const scoreMinLabel = document.getElementById("scoreMinLabel");
const scoreMaxLabel = document.getElementById("scoreMaxLabel");
const scoreRangeFill = document.getElementById("scoreRangeFill");
const scoreRangeClearButton = document.getElementById("clearScoreRange");
const filterToggleButton = document.getElementById("courseFilterToggle");
const sortToggleButton = document.getElementById("courseSortToggle");
const sortMenu = document.getElementById("courseSortMenu");
const sortLabel = document.getElementById("courseSortSelectedLabel");
const keywordList = document.getElementById("courseKeywordList");
const filterContainer = document.querySelector(".course-filter");
const resultsSummary = document.getElementById("courseResultsSummary");
const resetFiltersButton = document.getElementById("courseFilterReset");

// Biến lưu trữ các instance của MultiSelect (sẽ được gán trong 'initializeMultiSelects').
let categoryMultiSelect = null;
let difficultyMultiSelect = null;
let statusMultiSelect = null;

// Biến trạng thái nội bộ.
let activeKeyword = ""; // Lưu từ khóa gợi ý đang được chọn.
let isSortMenuOpen = false; // Trạng thái mở/đóng của menu sắp xếp.

// Điểm bắt đầu: Chạy 'initCoursePage' khi DOM đã tải xong.
document.addEventListener("DOMContentLoaded", initCoursePage);

// Hàm khởi tạo chính: Render gợi ý, khởi tạo MultiSelect, gán sự kiện và chạy 'applyFilters' lần đầu.
function initCoursePage() {
  if (!courseGrid) {
    return;
  }

  renderKeywordSuggestions();
  initializeMultiSelects();
  setScoreRangeValues(SCORE_MIN, SCORE_MAX, { silent: true });
  bindFilterEvents();
  applyFilters();
}

// Render các nút gợi ý tìm kiếm nhanh (dưới ô search) từ hằng số 'QUICK_KEYWORDS'.
function renderKeywordSuggestions() {
  if (!keywordList) {
    return;
  }

  keywordList.innerHTML = "";

  if (!QUICK_KEYWORDS.length) {
    return;
  }

  const label = document.createElement("span");
  label.className = "course-keywords__label";
  label.textContent = "Gợi ý:";
  keywordList.append(label);

  QUICK_KEYWORDS.forEach((keyword) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "course-keyword";
    button.dataset.keyword = keyword;
    button.textContent = keyword;
    keywordList.append(button);
  });
}

// Gán tất cả các trình xử lý sự kiện (listeners) cho các thành phần UI (search, slider, buttons...).
function bindFilterEvents() {
  if (filtersForm) {
    filtersForm.addEventListener("submit", (event) => event.preventDefault());
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      filters.search = event.target.value.trim();
      updateKeywordHighlight(filters.search);
      applyFilters();
    });
  }

  if (scoreMinInput && scoreMaxInput) {
    scoreMinInput.addEventListener("input", () => handleScoreRangeChange("min"));
    scoreMaxInput.addEventListener("input", () => handleScoreRangeChange("max"));
  }

  if (scoreRangeClearButton) {
    scoreRangeClearButton.addEventListener("click", () => {
      setScoreRangeValues(SCORE_MIN, SCORE_MAX, { silent: false });
    });
  }

  if (filterToggleButton && filtersForm) {
    filterToggleButton.addEventListener("click", toggleFilterPanel);
  }

  if (sortToggleButton && sortMenu) {
    sortToggleButton.addEventListener("click", toggleSortMenu);
  }

  if (sortMenu) {
    sortMenu.addEventListener("click", handleSortOptionClick);
  }

  if (keywordList) {
    keywordList.addEventListener("click", handleKeywordClick);
  }

  if (resetFiltersButton) {
    resetFiltersButton.addEventListener("click", resetAllFilters);
  }

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleGlobalKeydown);
}

// Reset tất cả trạng thái 'filters' về mặc định và cập nhật UI (DOM, MultiSelects) tương ứng.
// Kích hoạt 'applyFilters' ở cuối.
function resetAllFilters() {
  // Reset state
  filters.search = "";
  filters.category = [];
  filters.difficulty = [];
  filters.status = [];
  filters.scoreRange = { min: SCORE_MIN, max: SCORE_MAX };
  filters.sort = DEFAULT_SORT_OPTION;
  activeKeyword = "";

  // Reset UI
  if (searchInput) {
    searchInput.value = "";
  }
  setScoreRangeValues(SCORE_MIN, SCORE_MAX, { silent: true });
  if (categoryMultiSelect) {
    categoryMultiSelect.setValues([], { silent: true });
  }
  if (difficultyMultiSelect) {
    difficultyMultiSelect.setValues([], { silent: true });
  }
  if (statusMultiSelect) {
    statusMultiSelect.setValues([], { silent: true });
  }

  // Cập nhật UI và áp dụng filter
  updateKeywordHighlight(filters.search);
  closeAllMultiSelects();
  applyFilters();
}

// Xử lý sự kiện 'input' của thanh trượt điểm. Đảm bảo min <= max.
// Làm tròn giá trị và kích hoạt 'applyFilters'.
function handleScoreRangeChange(changedThumb) {
  if (!scoreMinInput || !scoreMaxInput) {
    return;
  }

  let min = Number(scoreMinInput.value);
  let max = Number(scoreMaxInput.value);

  // Đảm bảo min <= max
  if (min > max) {
    if (changedThumb === "min") {
      max = min;
      scoreMaxInput.value = String(max);
    } else {
      min = max;
      scoreMinInput.value = String(min);
    }
  }

  // Cập nhật state (đã làm tròn)
  filters.scoreRange.min = clampScoreValue(min);
  filters.scoreRange.max = clampScoreValue(max);
  scoreMinInput.value = String(filters.scoreRange.min);
  scoreMaxInput.value = String(filters.scoreRange.max);
  updateScoreRangeUI();
  applyFilters();
}

// Làm tròn giá trị điểm theo 'SCORE_STEP' và giới hạn trong khoảng [MIN, MAX].
function clampScoreValue(value) {
  const snapped = Math.round(value / SCORE_STEP) * SCORE_STEP;
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, snapped));
}

// Gán giá trị cho thanh trượt điểm (cập nhật state, DOM và UI).
// Tùy chọn 'silent' để không kích hoạt 'applyFilters' (dùng khi reset/khởi tạo).
function setScoreRangeValues(min, max, { silent = true } = {}) {
  if (!scoreMinInput || !scoreMaxInput) {
    return;
  }

  const normalizedMin = clampScoreValue(Math.min(min, max));
  const normalizedMax = clampScoreValue(Math.max(min, max));
  scoreMinInput.value = String(normalizedMin);
  scoreMaxInput.value = String(normalizedMax);
  filters.scoreRange.min = normalizedMin;
  filters.scoreRange.max = normalizedMax;
  updateScoreRangeUI();
  if (!silent) {
    applyFilters();
  }
}

// Cập nhật nhãn (label) min/max và thanh 'fill' (màu xanh lá) của slider.
function updateScoreRangeUI() {
  if (scoreMinLabel) {
    scoreMinLabel.textContent = String(filters.scoreRange.min);
  }

  if (scoreMaxLabel) {
    scoreMaxLabel.textContent = String(filters.scoreRange.max);
  }

  if (scoreRangeFill) {
    const range = SCORE_MAX - SCORE_MIN;
    const leftPercent = ((filters.scoreRange.min - SCORE_MIN) / range) * 100;
    const rightPercent = ((filters.scoreRange.max - SCORE_MIN) / range) * 100;
    scoreRangeFill.style.left = `${leftPercent}%`;
    scoreRangeFill.style.width = `${Math.max(0, rightPercent - leftPercent)}%`;
  }
}

// Xử lý click nút 'Bộ lọc': Mở/đóng panel filter.
// Đảm bảo đóng menu 'Sắp xếp' nếu đang mở.
function toggleFilterPanel() {
  if (!filtersForm || !filterToggleButton) {
    return;
  }

  if (isFilterPanelOpen()) {
    closeFilterPanel();
  } else {
    if (isSortMenuOpen) {
      closeSortMenu();
    }
    openFilterPanel();
  }
}

// Kiểm tra trạng thái (mở/đóng) của panel filter.
function isFilterPanelOpen() {
  return Boolean(filtersForm && !filtersForm.hasAttribute("hidden"));
}

// Hiển thị panel filter.
function openFilterPanel() {
  if (!filtersForm) {
    return;
  }

  filtersForm.removeAttribute("hidden");
  updateFilterButtonState();
}

// Ẩn panel filter và đóng tất cả MultiSelect bên trong.
function closeFilterPanel() {
  if (!filtersForm) {
    return;
  }

  if (!filtersForm.hasAttribute("hidden")) {
    filtersForm.setAttribute("hidden", "");
    updateFilterButtonState();
    closeAllMultiSelects();
  }
}

// Xử lý click nút 'Sắp xếp': Mở/đóng menu sắp xếp.
// Đảm bảo đóng panel 'Bộ lọc' nếu đang mở.
function toggleSortMenu() {
  if (!sortMenu || !sortToggleButton) {
    return;
  }

  if (isFilterPanelOpen()) {
    closeFilterPanel();
  }

  if (sortMenu.hasAttribute("hidden")) {
    openSortMenu();
  } else {
    closeSortMenu();
  }
}

// Hiển thị menu sắp xếp.
function openSortMenu() {
  if (!sortMenu || !sortToggleButton) {
    return;
  }

  sortMenu.removeAttribute("hidden");
  sortToggleButton.setAttribute("aria-expanded", "true");
  isSortMenuOpen = true;
  updateSortMenuState();
}

// Ẩn menu sắp xếp.
function closeSortMenu() {
  if (!sortMenu || !sortToggleButton) {
    return;
  }

  if (!sortMenu.hasAttribute("hidden")) {
    sortMenu.setAttribute("hidden", "");
  }

  sortToggleButton.setAttribute("aria-expanded", "false");
  isSortMenuOpen = false;
  updateSortMenuState();
}

// Xử lý khi chọn một tùy chọn sắp xếp: Cập nhật state 'filters.sort' và kích hoạt 'applyFilters'.
function handleSortOptionClick(event) {
  const option = event.target.closest(".course-sort__option");
  if (!option) {
    return;
  }

  const sortValue = option.dataset.sort;
  if (!sortValue) {
    return;
  }

  filters.sort = sortValue;
  closeSortMenu();
  applyFilters();
}

// Xử lý click nút gợi ý: Cập nhật ô search, state 'filters.search' và kích hoạt 'applyFilters'.
// Click lần 2 để xóa.
function handleKeywordClick(event) {
  const button = event.target.closest(".course-keyword");
  if (!button) {
    return;
  }

  const keyword = button.dataset.keyword || button.textContent.trim();
  const isSameKeyword =
    normalizeText(keyword) === normalizeText(activeKeyword);

  if (isSameKeyword) {
    // Click lần 2 -> Xóa filter
    filters.search = "";
    activeKeyword = "";
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
  } else {
    // Click lần 1 -> Áp dụng filter
    filters.search = keyword;
    activeKeyword = keyword;
    if (searchInput) {
      searchInput.value = keyword;
      searchInput.focus();
    }
  }

  updateKeywordHighlight(filters.search);
  applyFilters();
}

// Xử lý click-outside cho menu 'Sắp xếp' và panel 'Bộ lọc'.
function handleDocumentClick(event) {
  // Đóng menu Sắp xếp nếu click ngoài.
  if (
    isSortMenuOpen &&
    sortMenu &&
    sortToggleButton &&
    !sortMenu.contains(event.target) &&
    !sortToggleButton.contains(event.target)
  ) {
    closeSortMenu();
  }

  // Đóng panel Lọc nếu click ngoài.
  if (
    isFilterPanelOpen() &&
    filterContainer &&
    !filterContainer.contains(event.target)
  ) {
    closeFilterPanel();
  }
}

// Xử lý phím 'Escape' toàn cục: Đóng menu 'Sắp xếp' hoặc panel 'Bộ lọc'.
function handleGlobalKeydown(event) {
  if (event.key !== "Escape") {
    return;
  }

  // Ưu tiên đóng menu Sắp xếp trước.
  if (isSortMenuOpen) {
    closeSortMenu();
    if (sortToggleButton) {
      sortToggleButton.focus();
    }
    return;
  }

  // Nếu không, đóng panel Lọc.
  if (isFilterPanelOpen()) {
    closeFilterPanel();
    if (filterToggleButton) {
      filterToggleButton.focus();
    }
  }
}

// Cập nhật class 'is-active' cho các nút gợi ý dựa trên giá trị search hiện tại.
function updateKeywordHighlight(currentValue) {
  if (!keywordList) {
    return;
  }

  const normalizedValue = normalizeText(currentValue);
  activeKeyword = "";

  keywordList.querySelectorAll(".course-keyword").forEach((button) => {
    const keyword = button.dataset.keyword || button.textContent;
    const isMatch =
      normalizedValue &&
      normalizeText(keyword) === normalizedValue;

    button.classList.toggle("is-active", Boolean(isMatch));

    if (isMatch) {
      activeKeyword = keyword;
    }
  });
}

// Cập nhật trạng thái 'is-active' cho nút 'Bộ lọc'
// (sáng lên nếu panel đang mở HOẶC có filter đang áp dụng).
function updateFilterButtonState() {
  if (!filterToggleButton) {
    return;
  }

  const panelOpen = isFilterPanelOpen();
  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.status.length > 0 ||
    !isScoreRangeDefault();

  filterToggleButton.classList.toggle("is-active", panelOpen || hasActiveFilters);
  filterToggleButton.setAttribute("aria-expanded", String(panelOpen));
}

// Cập nhật nhãn (label) và trạng thái 'is-active' cho nút 'Sắp xếp'.
function updateSortMenuState() {
  if (sortLabel) {
    sortLabel.textContent =
      SORT_LABELS[filters.sort] ||
      SORT_LABELS[DEFAULT_SORT_OPTION] ||
      SORT_LABELS.default;
  }

  if (sortMenu) {
    sortMenu.querySelectorAll(".course-sort__option").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.sort === filters.sort);
    });
  }

  if (sortToggleButton) {
    const shouldHighlight = isSortMenuOpen || filters.sort !== DEFAULT_SORT_OPTION;
    sortToggleButton.setAttribute("aria-expanded", String(isSortMenuOpen));
    sortToggleButton.classList.toggle("is-active", shouldHighlight);
  }
}

// Hàm trung tâm: Lọc, sắp xếp 'courseCatalog' dựa trên state 'filters'
// và gọi hàm render/update UI.
function applyFilters() {
  // 1. Lọc
  const filteredCourses = courseCatalog.filter(
    (course) =>
      matchesSearch(course) &&
      matchesCategory(course) &&
      matchesDifficulty(course) &&
      matchesStatus(course) &&
      matchesScoreRange(course)
  );

  // 2. Sắp xếp
  const sortedCourses = sortCourses(filteredCourses);

  // 3. Render
  renderCourseCatalog(sortedCourses);
  updateResultsSummary(sortedCourses.length);
  updateFilterButtonState();
  updateSortMenuState();
  updateKeywordHighlight(filters.search);
}

// Logic lọc: Kiểm tra khóa học có khớp với 'filters.search' (kiểm tra title, description, category).
function matchesSearch(course) {
  if (!filters.search) {
    return true;
  }

  const searchTerm = normalizeText(filters.search);
  const haystack = [
    course.title,
    course.description,
    formatCategoryLabel(course.category)
  ].join(" ");

  return normalizeText(haystack).includes(searchTerm);
}

// Logic lọc: Kiểm tra khóa học có khớp với 'filters.category'.
function matchesCategory(course) {
  if (!filters.category.length) {
    return true;
  }

  return filters.category.includes(course.category);
}

// Logic lọc: Kiểm tra khóa học có khớp với 'filters.difficulty'.
function matchesDifficulty(course) {
  if (!filters.difficulty.length) {
    return true;
  }

  return filters.difficulty.includes(course.difficulty);
}

// Logic lọc: Kiểm tra khóa học có khớp với 'filters.status' (available/upcoming).
function matchesStatus(course) {
  if (!filters.status.length) {
    return true;
  }

  const courseStatus = course.available ? "available" : "upcoming";
  return filters.status.includes(courseStatus);
}

// Logic lọc: Kiểm tra điểm số khóa học có nằm trong 'filters.scoreRange'.
function matchesScoreRange(course) {
  if (isScoreRangeDefault()) {
    return true;
  }

  const score = Math.max(0, getBestScore(course));
  return score >= filters.scoreRange.min && score <= filters.scoreRange.max;
}

// Kiểm tra nếu bộ lọc điểm đang ở giá trị mặc định (0-100).
function isScoreRangeDefault() {
  return (
    filters.scoreRange.min === SCORE_MIN && filters.scoreRange.max === SCORE_MAX
  );
}

// Sắp xếp mảng khóa học dựa trên 'filters.sort' (sử dụng các hàm 'compare...' bên dưới).
function sortCourses(courses) {
  const sorted = [...courses];

  switch (filters.sort) {
    case "default":
      sorted.sort(compareAvailableAlphabetical);
      break;
    case "difficulty-asc":
      sorted.sort((a, b) => compareDifficulty(a, b));
      break;
    case "difficulty-desc":
      sorted.sort((a, b) => compareDifficulty(b, a));
      break;
    case "title-asc":
      sorted.sort(compareTitleAscending);
      break;
    case "title-desc":
      sorted.sort((a, b) =>
        b.title.localeCompare(a.title, "vi", { sensitivity: "base" })
      );
      break;
    case "score-asc":
      sorted.sort((a, b) => compareScore(a, b, true));
      break;
    case "score-desc":
      sorted.sort((a, b) => compareScore(a, b, false));
      break;
    default:
      break;
  }

  return sorted;
}

// Hàm so sánh (sắp xếp) theo độ khó (dùng 'DIFFICULTY_ORDER').
function compareDifficulty(a, b) {
  const orderA = DIFFICULTY_ORDER[a.difficulty] ?? Number.MAX_SAFE_INTEGER;
  const orderB = DIFFICULTY_ORDER[b.difficulty] ?? Number.MAX_SAFE_INTEGER;
  return orderA - orderB;
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

// Hàm so sánh (sắp xếp) theo điểm. Ưu tiên 'available', sau đó so sánh điểm (hoặc A-Z nếu bằng điểm).
function compareScore(a, b, ascending = true) {
  if (a.available !== b.available) {
    return a.available ? -1 : 1;
  }

  const scoreA = getBestScore(a);
  const scoreB = getBestScore(b);

  if (scoreA === scoreB) {
    return a.title.localeCompare(b.title, "vi", { sensitivity: "base" });
  }

  return ascending ? scoreA - scoreB : scoreB - scoreA;
}

// Lấy điểm cao nhất (best score) của khóa học từ localStorage.
// Trả về 0 nếu 'upcoming'.
function getBestScore(course) {
  if (!course.available) {
    return 0;
  }

  return Number(localStorage.getItem(`bestScore_${course.id}`) || 0);
}

// Render (vẽ) danh sách các thẻ (card) khóa học vào 'courseGrid'.
// Xử lý trạng thái rỗng (empty state) nếu không có kết quả.
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
      "Không tìm\u00A0thấy chủ\u00A0đề phù hợp. Hãy thử từ\u00A0khóa khác hoặc điều chỉnh bộ\u00A0lọc.";
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
    const availabilityLabel = course.available ? "Có\u00A0sẵn" : "Sắp\u00A0ra\u00A0mắt";
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
            ? `<p class="course-card__best-score">Điểm&nbsp;cao nhất: ${bestScore}/100</p>`
            : `<p class="course-card__note">Nội&nbsp;dung sẽ được cập&nbsp;nhật sớm.</p>`
        }
        ${
          // Hiển thị nút 'Làm quiz' nếu 'available'.
          course.available
            ? `<div class="course-card__actions">
                 <button class="course-card__btn" type="button" data-quiz-id="${course.id}">
                   Làm&nbsp;quiz <span class="course-card__btn-icon" aria-hidden="true">➜</span>
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

// Cập nhật text tóm tắt kết quả (ví dụ: 'Tìm thấy X / Y chủ đề cho [bộ lọc]...').
function updateResultsSummary(resultCount) {
  if (!resultsSummary) {
    return;
  }

  const total = courseCatalog.length;
  const summaryParts = [`Tìm\u00A0thấy ${resultCount} / ${total} chủ\u00A0đề`];

  const filtersApplied = [];

  if (filters.category.length) {
    const categoryNames = filters.category.map((category) => formatCategoryLabel(category));
    filtersApplied.push(`danh\u00A0mục ${categoryNames.join(", ")}`);
  }

  if (filters.difficulty.length) {
    const difficultyNames = filters.difficulty.map((key) => DIFFICULTY_MULTI_LABELS[key] || key);
    filtersApplied.push(`trình\u00A0độ ${difficultyNames.join(", ")}`);
  }

  if (filters.status.length) {
    const statusNames = filters.status.map((key) => STATUS_LABELS[key] || key);
    filtersApplied.push(`trạng\u00A0thái ${statusNames.join(", ")}`);
  }

  if (!isScoreRangeDefault()) {
    filtersApplied.push(`khoảng\u00A0điểm ${filters.scoreRange.min} – ${filters.scoreRange.max}`);
  }

  if (filters.search) {
    filtersApplied.push(`từ\u00A0khóa "${filters.search}"`);
  }

  if (filtersApplied.length) {
    summaryParts.push(`cho ${filtersApplied.join(", ")}`);
  }

  resultsSummary.textContent = `${summaryParts.join(" ")}.`;
}

// Tiện ích: Chuyển key (vd: 'food') thành nhãn (vd: 'Ẩm thực') từ hằng số. Có fallback.
function formatCategoryLabel(categoryKey) {
  const fallback = categoryKey
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
  return CATEGORY_LABELS[categoryKey] || fallback;
}

// Tiện ích: Chuẩn hóa chuỗi (lowercase, bỏ dấu) để tìm kiếm/so sánh không phân biệt.
function normalizeText(value) {
  if (!value) {
    return "";
  }
  return value
    .toString()
    .normalize("NFD") // Tách dấu
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
    .toLowerCase(); // Chuyển sang chữ thường
}