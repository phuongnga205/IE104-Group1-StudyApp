/*
  File: main.js
  Mô tả: Quản lý chế độ sáng/tối, hiệu ứng reveal khi cuộn và carousel tính năng trên trang chủ Learnie.
  Người thực hiện: Lê Ngọc Phương Nga - 23520992
  Ngày cập nhật: 19/11/2025
*/

// Khóa lưu trữ chế độ giao diện trong localStorage
const THEME_STORAGE_KEY = "learnie.theme";

// Nút toggle theme (được render trên mọi trang)
const themeToggleButton = document.getElementById("themeToggle");

// Áp dụng theme tương ứng cho body và cập nhật icon nút
function applyTheme(themeMode) {
  const normalizedMode = themeMode === "dark" ? "dark" : "light";
  document.body.classList.toggle("dark", normalizedMode === "dark");

  if (themeToggleButton) {
    const isDarkMode = normalizedMode === "dark";
    themeToggleButton.textContent = isDarkMode ? "☀️" : "🌙";
    themeToggleButton.setAttribute("aria-pressed", isDarkMode ? "true" : "false");
  }
}

// Đọc theme đã lưu, nếu không có thì mặc định sáng
const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
applyTheme(storedTheme);

// Lắng nghe sự kiện click để chuyển đổi theme và lưu lại
if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    const isDarkMode = document.body.classList.contains("dark");
    const nextTheme = isDarkMode ? "light" : "dark";

    // Cập nhật giao diện và lưu lại lựa chọn của người dùng
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

// Hiển thị các khối có class .reveal khi chúng đi vào tầm nhìn của người dùng
function handleRevealOnScroll() {
  const revealBlocks = document.querySelectorAll(".reveal");
  const triggerPosition = window.innerHeight * 0.85;

  revealBlocks.forEach((block) => {
    const blockTop = block.getBoundingClientRect().top;
    if (blockTop < triggerPosition) {
      block.classList.add("reveal--visible");
    }
  });
}

// Tạo slider cho phần Tính năng nổi bật (hiển thị 3 thẻ và trượt qua lại)
function initFeatureCarousel() {
  // Lấy phần tử bao toàn bộ carousel
  const carousel = document.querySelector("[data-feature-carousel]");
  
  // Nếu không có carousel thì thoát (tránh lỗi trên trang khác)
  if (!carousel) {
    return;
  }

  // Lấy các phần tử con cần dùng
  const viewport = carousel.querySelector(".feature-carousel__viewport"); // khung nhìn
  const track = carousel.querySelector(".feature-carousel__track"); // hàng chứa các thẻ feature-card
  const prevButton = carousel.querySelector("[data-carousel-prev]"); // nút lùi
  const nextButton = carousel.querySelector("[data-carousel-next]"); // nút tới

  // Nếu thiếu bất kỳ phần nào thì không khởi tạo slider
  if (!viewport || !track || !prevButton || !nextButton) {
    return;
  }

  const cardSelector = ".feature-card";

  // Nếu không có thẻ tính năng nào thì không cần slider
  if (!track.querySelector(cardSelector)) {
    return;
  }

  // Biến trạng thái / timer
  let resizeTimer = null;
  let autoSlideTimer = null;
  let isTransitioning = false;
  let canSlide = false;
  let itemsPerView = 1;
  let stepSize = 0;
  let isUserInteracting = false;

  // Báo cho CSS biết là carousel đã sẵn sàng (disable scroll tay, dùng slider)
  carousel.classList.add("feature-carousel--ready");

  // Tính số card hiển thị theo kích thước màn hình
  function getItemsPerView() {
    if (window.innerWidth <= 639) {
      return 1;
    }

    if (window.innerWidth <= 1023) {
      return 2;
    }

    return 3;
  }

  // Lấy khoảng cách gap giữa các card từ CSS
  function getGapSize() {
    const styles = window.getComputedStyle(track);
    const rawGap = styles.columnGap || styles.gap || "0";
    const parsedGap = Number.parseFloat(rawGap);
    return Number.isNaN(parsedGap) ? 0 : parsedGap;
  }

  // Tính stepSize = chiều rộng 1 card + gap
  function computeStepSize() {
    const firstCard = track.querySelector(cardSelector);

    if (!firstCard) {
      stepSize = 0;
      return;
    }

    const cardRect = firstCard.getBoundingClientRect();
    const width = cardRect ? cardRect.width : 0;
    const gap = getGapSize();

    if (width === 0) {
      // Fallback: nếu chưa đo được width card, dùng viewport chia cho itemsPerView
      stepSize = viewport.clientWidth / Math.max(1, itemsPerView);
      return;
    }

    stepSize = width + gap;
  }

  // Bật/tắt nút điều khiển + class has-controls
  function updateControls(isActive) {
    if (isActive) {
      carousel.classList.add("feature-carousel--has-controls");
      prevButton.disabled = false;
      nextButton.disabled = false;
      prevButton.tabIndex = 0;
      nextButton.tabIndex = 0;
    } else {
      carousel.classList.remove("feature-carousel--has-controls");
      prevButton.disabled = true;
      nextButton.disabled = true;
      prevButton.tabIndex = -1;
      nextButton.tabIndex = -1;
    }
  }

  // Dừng auto slide nếu đang chạy
  function stopAutoSlide() {
    if (!autoSlideTimer) {
      return;
    }

    window.clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }

  // Bắt đầu auto slide (chỉ khi không tương tác và có thể slide)
  function startAutoSlide() {
    if (isUserInteracting) {
      return;
    }

    stopAutoSlide();

    if (!canSlide) {
      return;
    }

    autoSlideTimer = window.setInterval(() => {
      goToNext("auto");
    }, 3000);
  }

  // Restart auto slide (dùng sau khi user bấm next/prev)
  function restartAutoSlide() {
    if (isUserInteracting) {
      return;
    }
    stopAutoSlide();
    startAutoSlide();
  }

  // Khi user hover/focus vào carousel -> tạm dừng auto slide
  function pauseAutoSlideForInteraction() {
    if (isUserInteracting) {
      return;
    }
    isUserInteracting = true;
    stopAutoSlide();
  }

  // Khi user rời khỏi carousel -> cho auto slide chạy lại
  function resumeAutoSlideAfterInteraction() {
    if (!isUserInteracting) {
      return;
    }
    isUserInteracting = false;
    startAutoSlide();
  }

  // Reset transform về 0 ngay lập tức (không transition) để tránh lệch
  function lockTransformToZero() {
    track.classList.add("feature-carousel__track--no-transition");
    track.style.transform = "translateX(0)";
    window.requestAnimationFrame(() => {
      track.classList.remove("feature-carousel__track--no-transition");
    });
  }

  // Đồng bộ lại các thông số khi load / resize
  function syncMetrics() {
    itemsPerView = getItemsPerView();
    const totalCards = track.children.length;
    canSlide = totalCards > itemsPerView;
    computeStepSize();
    updateControls(canSlide);

    if (!canSlide) {
      // Nếu không đủ card để trượt thì reset vị trí và tắt auto slide
      lockTransformToZero();
      stopAutoSlide();
    }
  }

  // Trượt tới (sang phải) - có thể do auto hoặc manual
  function goToNext(triggerSource = "manual") {
    // Đang animate thì không cho trượt thêm
    if (isTransitioning) {
      return;
    }

    // Cập nhật thông số mới nhất (nhỡ user vừa resize)
    syncMetrics();

    if (!canSlide || stepSize <= 0) {
      return;
    }

    isTransitioning = true;
    // Dịch track sang trái 1 bước
    track.style.transform = `translateX(-${stepSize}px)`;

    const handleTransitionEnd = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      
      // Tắt transition tạm thời để sắp lại DOM
      track.classList.add("feature-carousel__track--no-transition");
      
      // Đưa phần tử đầu xuống cuối -> tạo hiệu ứng vòng lặp
      const firstChild = track.firstElementChild;

      if (firstChild) {
        track.appendChild(firstChild);
      }

      // Reset transform về 0
      track.style.transform = "translateX(0)";
      // Force reflow để trình duyệt áp dụng transform mới
      track.getBoundingClientRect();
      // Bật lại transition
      track.classList.remove("feature-carousel__track--no-transition");
      isTransitioning = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd, { once: true });

    // Nếu user tự bấm next thì restart auto slide
    if (triggerSource === "manual") {
      restartAutoSlide();
    }
  }

  // Trượt lùi (sang trái logically, slider chạy ngược lại)
  function goToPrevious() {
    if (isTransitioning) {
      return;
    }

    syncMetrics();

    if (!canSlide || stepSize <= 0) {
      return;
    }

    isTransitioning = true;
    // Tắt transition để sắp lại phần tử cuối lên đầu
    track.classList.add("feature-carousel__track--no-transition");

    const lastChild = track.lastElementChild;

    if (lastChild) {
      // Đưa phần tử cuối lên đầu
      track.insertBefore(lastChild, track.firstElementChild);
    }

    // Đặt track ở vị trí lệch sang trái 1 bước
    track.style.transform = `translateX(-${stepSize}px)`;
    // Force reflow để trình duyệt ghi nhận vị trí này
    track.getBoundingClientRect();
    // Bật lại transition và animate quay về 0
    track.classList.remove("feature-carousel__track--no-transition");
    track.style.transform = "translateX(0)";

    const handleTransitionEnd = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      isTransitioning = false;
    };
    
    track.addEventListener("transitionend", handleTransitionEnd, { once: true });

    // Sau khi user bấm prev thì restart auto slide
    restartAutoSlide();
  }

  // Sự kiện click nút prev/next
  prevButton.addEventListener("click", () => {
    goToPrevious();
  });

  nextButton.addEventListener("click", () => {
    goToNext("manual");
  });

  // Khi user hover/focus vào carousel -> dừng auto slide
  carousel.addEventListener("mouseenter", pauseAutoSlideForInteraction);
  carousel.addEventListener("mouseleave", resumeAutoSlideAfterInteraction);
  carousel.addEventListener("focusin", pauseAutoSlideForInteraction);
  carousel.addEventListener("focusout", (event) => {
    // Chỉ resume khi focus ra khỏi toàn bộ carousel
    if (!carousel.contains(event.relatedTarget)) {
      resumeAutoSlideAfterInteraction();
    }
  });

  // Khi resize màn hình -> cập nhật lại metrics và reset vị trí
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    // Debounce 140ms để tránh tính toán lại quá nhiều lần
    resizeTimer = window.setTimeout(() => {
      syncMetrics();
      lockTransformToZero();
      restartAutoSlide();
    }, 140);
  });
  
  // Khởi tạo carousel ngay lần đầu
  syncMetrics();
  startAutoSlide();
}

// Gắn sự kiện khi cuộn và chạy ngay khi trang load xong
window.addEventListener("scroll", handleRevealOnScroll);
handleRevealOnScroll();
initFeatureCarousel();
