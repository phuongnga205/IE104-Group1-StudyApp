/*
  File: main.js
  Mô tả: Quản lý chế độ sáng/tối, hiệu ứng reveal khi cuộn và carousel tính năng trên trang chủ Learnie.
  Người thực hiện: Nguyễn Đặng Quang Phúc – 23521204
  Ngày cập nhật: 16/11/2025
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
  const carousel = document.querySelector("[data-feature-carousel]");

  if (!carousel) {
    return;
  }

  const viewport = carousel.querySelector(".feature-carousel__viewport");
  const track = carousel.querySelector(".feature-carousel__track");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");

  if (!viewport || !track || !prevButton || !nextButton) {
    return;
  }

  const cardSelector = ".feature-card";

  if (!track.querySelector(cardSelector)) {
    return;
  }

  let resizeTimer = null;
  let autoSlideTimer = null;
  let isTransitioning = false;
  let canSlide = false;
  let itemsPerView = 1;
  let stepSize = 0;
  let isUserInteracting = false;

  carousel.classList.add("feature-carousel--ready");

  function getItemsPerView() {
    if (window.innerWidth <= 639) {
      return 1;
    }

    if (window.innerWidth <= 1023) {
      return 2;
    }

    return 3;
  }

  function getGapSize() {
    const styles = window.getComputedStyle(track);
    const rawGap = styles.columnGap || styles.gap || "0";
    const parsedGap = Number.parseFloat(rawGap);
    return Number.isNaN(parsedGap) ? 0 : parsedGap;
  }

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
      stepSize = viewport.clientWidth / Math.max(1, itemsPerView);
      return;
    }

    stepSize = width + gap;
  }

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

  function stopAutoSlide() {
    if (!autoSlideTimer) {
      return;
    }

    window.clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }

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

  function restartAutoSlide() {
    if (isUserInteracting) {
      return;
    }
    stopAutoSlide();
    startAutoSlide();
  }

  function pauseAutoSlideForInteraction() {
    if (isUserInteracting) {
      return;
    }
    isUserInteracting = true;
    stopAutoSlide();
  }

  function resumeAutoSlideAfterInteraction() {
    if (!isUserInteracting) {
      return;
    }
    isUserInteracting = false;
    startAutoSlide();
  }

  function lockTransformToZero() {
    track.classList.add("feature-carousel__track--no-transition");
    track.style.transform = "translateX(0)";
    window.requestAnimationFrame(() => {
      track.classList.remove("feature-carousel__track--no-transition");
    });
  }

  function syncMetrics() {
    itemsPerView = getItemsPerView();
    const totalCards = track.children.length;
    canSlide = totalCards > itemsPerView;
    computeStepSize();
    updateControls(canSlide);

    if (!canSlide) {
      lockTransformToZero();
      stopAutoSlide();
    }
  }

  function goToNext(triggerSource = "manual") {
    if (isTransitioning) {
      return;
    }

    syncMetrics();

    if (!canSlide || stepSize <= 0) {
      return;
    }

    isTransitioning = true;
    track.style.transform = `translateX(-${stepSize}px)`;

    const handleTransitionEnd = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      track.classList.add("feature-carousel__track--no-transition");
      const firstChild = track.firstElementChild;

      if (firstChild) {
        track.appendChild(firstChild);
      }

      track.style.transform = "translateX(0)";
      track.getBoundingClientRect();
      track.classList.remove("feature-carousel__track--no-transition");
      isTransitioning = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd, { once: true });

    if (triggerSource === "manual") {
      restartAutoSlide();
    }
  }

  function goToPrevious() {
    if (isTransitioning) {
      return;
    }

    syncMetrics();

    if (!canSlide || stepSize <= 0) {
      return;
    }

    isTransitioning = true;
    track.classList.add("feature-carousel__track--no-transition");

    const lastChild = track.lastElementChild;

    if (lastChild) {
      track.insertBefore(lastChild, track.firstElementChild);
    }

    track.style.transform = `translateX(-${stepSize}px)`;
    track.getBoundingClientRect();
    track.classList.remove("feature-carousel__track--no-transition");
    track.style.transform = "translateX(0)";

    const handleTransitionEnd = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      isTransitioning = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd, { once: true });

    restartAutoSlide();
  }

  prevButton.addEventListener("click", () => {
    goToPrevious();
  });

  nextButton.addEventListener("click", () => {
    goToNext("manual");
  });

  carousel.addEventListener("mouseenter", pauseAutoSlideForInteraction);
  carousel.addEventListener("mouseleave", resumeAutoSlideAfterInteraction);
  carousel.addEventListener("focusin", pauseAutoSlideForInteraction);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      resumeAutoSlideAfterInteraction();
    }
  });

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      syncMetrics();
      lockTransformToZero();
      restartAutoSlide();
    }, 140);
  });

  syncMetrics();
  startAutoSlide();
}

// Xử lý hamburger menu cho mobile
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (!menuToggle || !mainNav) {
    return;
  }

  // Toggle menu khi click vào hamburger button
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    const newState = !isExpanded;

    menuToggle.setAttribute("aria-expanded", String(newState));
    mainNav.setAttribute("aria-expanded", String(newState));
  });

  // Đóng menu khi click vào link navigation
  const navLinks = mainNav.querySelectorAll(".main-nav__link");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false");
      mainNav.setAttribute("aria-expanded", "false");
    });
  });

  // Đóng menu khi click ra ngoài (chỉ trên mobile)
  document.addEventListener("click", (event) => {
    const isMobile = window.innerWidth <= 767;
    if (!isMobile) {
      return;
    }

    const isClickInsideNav = mainNav.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);

    if (!isClickInsideNav && !isClickOnToggle) {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        menuToggle.setAttribute("aria-expanded", "false");
        mainNav.setAttribute("aria-expanded", "false");
      }
    }
  });

  // Đóng menu khi nhấn phím Escape
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        menuToggle.setAttribute("aria-expanded", "false");
        mainNav.setAttribute("aria-expanded", "false");
        menuToggle.focus();
      }
    }
  });
}

// Gắn sự kiện khi cuộn và chạy ngay khi trang load xong
window.addEventListener("scroll", handleRevealOnScroll);
handleRevealOnScroll();
initFeatureCarousel();
initMobileMenu();
