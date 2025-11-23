/*
  File: main.js
  Mô tả: Quản lý chế độ sáng/tối, hiệu ứng reveal khi cuộn và carousel tính năng trên trang chủ Learnie.
  Người thực hiện: Lê Ngọc Phương Nga – 23520992
  Ngày cập nhật: 23/11/2025
*/

// Khóa lưu trữ chế độ giao diện trong localStorage
const THEME_STORAGE_KEY = "learnie.theme";

// Nút toggle theme (được render trên mọi trang)
const themeToggleButton = document.getElementById("themeToggle");

// Áp dụng theme tương ứng cho body và cập nhật icon nút
function applyTheme(themeMode) {
  // Note: Chuẩn hóa giá trị đầu vào, chỉ chấp nhận 'dark' hoặc 'light'.
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
  // Note: Kích hoạt hiệu ứng khi phần tử cách đỉnh viewport 85% chiều cao màn hình.
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
  
  // Note: Nếu không tìm thấy phần tử carousel trên trang, dừng thực thi để tránh lỗi.
  if (!carousel) {
    return;
  }

  // Note: Cache các phần tử DOM quan trọng của carousel.
  const viewport = carousel.querySelector(".feature-carousel__viewport");
  const track = carousel.querySelector(".feature-carousel__track");
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  
  // Note: Kiểm tra sự tồn tại của các thành phần cốt lõi.
  if (!viewport || !track || !prevButton || !nextButton) {
    return;
  }

  const cardSelector = ".feature-card";
  const cards = Array.from(track.querySelectorAll(cardSelector));

  // Note: Nếu không có thẻ nào trong carousel, không cần khởi tạo.
  if (cards.length === 0) {
    return;
  }

  // Note: Tạo pagination dots container
  const paginationContainer = document.createElement("div");
  paginationContainer.className = "feature-carousel__pagination";
  paginationContainer.setAttribute("role", "tablist");
  paginationContainer.setAttribute("aria-label", "Điều hướng carousel");
  carousel.appendChild(paginationContainer);

  // Note: Tạo dots cho mỗi card
  const dots = [];
  cards.forEach((card, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "feature-carousel__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Chuyển đến tính năng ${index + 1}`);
    dot.setAttribute("aria-selected", index === 0 ? "true" : "false");
    dot.dataset.index = String(index);
    
    dot.addEventListener("click", () => {
      goToCard(index);
    });
    
    paginationContainer.appendChild(dot);
    dots.push(dot);
  });

  // Note: Biến theo dõi vị trí hiện tại (index của card đầu tiên đang hiển thị)
  let currentCardIndex = 0;

  let resizeTimer = null;
  let autoSlideTimer = null;
  let isTransitioning = false;
  let canSlide = false;
  let itemsPerView = 1;
  let stepSize = 0;
  let isUserInteracting = false;

  // Note: Thêm class để báo hiệu JS đã sẵn sàng, cho phép CSS ẩn thanh cuộn.
  carousel.classList.add("feature-carousel--ready");

  // Note: Xác định số lượng card hiển thị dựa trên độ rộng màn hình (responsive).
  function getItemsPerView() {
    if (window.innerWidth <= 639) {
      return 1;
    }
    
    if (window.innerWidth <= 1023) {
      return 2;
    }

    return 3;
  }

  // Note: Lấy giá trị 'gap' từ CSS để tính toán khoảng cách trượt chính xác.
  function getGapSize() {
    const styles = window.getComputedStyle(track);
    const rawGap = styles.columnGap || styles.gap || "0";
    const parsedGap = Number.parseFloat(rawGap);
    return Number.isNaN(parsedGap) ? 0 : parsedGap;
  }

  // Note: Tính toán khoảng cách cần trượt cho một bước, bằng chiều rộng của một card cộng với khoảng cách gap.
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

  // Note: Cập nhật trạng thái (hiển thị/ẩn, bật/tắt) của các nút điều khiển.
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

  // Note: Cập nhật pagination dots dựa trên currentCardIndex
  function updatePagination() {
    dots.forEach((dot, index) => {
      const isActive = index === currentCardIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
    });
  }

  // Note: Chuyển đến card cụ thể (dùng khi click vào dot)
  function goToCard(targetIndex) {
    if (isTransitioning || targetIndex === currentCardIndex) {
      return;
    }

    const totalCards = cards.length;
    if (targetIndex < 0 || targetIndex >= totalCards) {
      return;
    }

    // Note: Tính số bước cần trượt (xử lý wrap-around)
    let steps = targetIndex - currentCardIndex;
    if (steps < 0) {
      steps += totalCards;
    }
    if (steps > totalCards / 2) {
      steps = steps - totalCards;
    }

    // Note: Trượt từng bước một, đợi mỗi bước hoàn thành
    let stepCount = 0;
    const maxSteps = Math.abs(steps);
    
    function executeNextStep() {
      if (stepCount >= maxSteps) {
        return;
      }
      
      if (steps > 0) {
        goToNext("manual");
      } else {
        goToPrevious();
      }
      
      stepCount++;
      
      // Note: Đợi transition hoàn thành trước khi trượt tiếp
      if (stepCount < maxSteps) {
        const firstCard = cards[0];
        if (firstCard) {
          const handleStepComplete = () => {
            firstCard.removeEventListener("transitionend", handleStepComplete);
            executeNextStep();
          };
          firstCard.addEventListener("transitionend", handleStepComplete, { once: true });
        }
      }
    }
    
    executeNextStep();
  }

  // Note: Dừng việc tự động trượt.
  function stopAutoSlide() {
    if (!autoSlideTimer) {
      return;
    }

    window.clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }

  // Note: Bắt đầu hoặc khởi động lại chu trình tự động trượt.
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

  // Note: Khởi động lại bộ đếm thời gian tự động trượt (thường sau khi người dùng tương tác).
  function restartAutoSlide() {
    if (isUserInteracting) {
      return;
    }
    stopAutoSlide();
    startAutoSlide();
  }

  // Note: Tạm dừng tự động trượt khi người dùng tương tác với carousel.
  function pauseAutoSlideForInteraction() {
    if (isUserInteracting) {
      return;
    }
    isUserInteracting = true;
    stopAutoSlide();
  }

  // Note: Tiếp tục tự động trượt sau khi người dùng ngừng tương tác.
  function resumeAutoSlideAfterInteraction() {
    if (!isUserInteracting) {
      return;
    }
    isUserInteracting = false;
    startAutoSlide();
  }

  // Note: Đặt lại vị trí của track về 0 mà không có hiệu ứng chuyển động.
  function lockTransformToZero() {
    track.classList.add("feature-carousel__track--no-transition");
    track.style.transform = "translateX(0)";
    window.requestAnimationFrame(() => {
      track.classList.remove("feature-carousel__track--no-transition");
    });
  }

  // Note: Đồng bộ hóa các giá trị tính toán (kích thước, số item,...) khi có thay đổi (resize).
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

  // Note: Logic để trượt sang card tiếp theo.
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

    // Note: Sau khi hiệu ứng trượt kết thúc, di chuyển card đầu tiên xuống cuối và reset vị trí.
    const handleTransitionEnd = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      // Note: Tạm thời tắt transition để di chuyển DOM mà không gây hiệu ứng giật.
      track.classList.add("feature-carousel__track--no-transition");
      const firstChild = track.firstElementChild;

      if (firstChild) {
        track.appendChild(firstChild);
      }

      // Note: Cập nhật currentCardIndex sau khi di chuyển DOM
      currentCardIndex = (currentCardIndex + 1) % cards.length;
      updatePagination();

      // Note: Reset transform và bật lại transition cho lần trượt tiếp theo.
      track.style.transform = "translateX(0)";
      track.getBoundingClientRect();
      track.classList.remove("feature-carousel__track--no-transition");
      isTransitioning = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd, { once: true });

    // Note: Nếu hành động do người dùng thực hiện, khởi động lại bộ đếm tự động trượt.
    if (triggerSource === "manual") {
      restartAutoSlide();
    }
  }

  // Note: Logic để trượt về card phía trước.
  function goToPrevious() {
    if (isTransitioning) {
      return;
    }

    syncMetrics();

    if (!canSlide || stepSize <= 0) {
      return;
    }

    isTransitioning = true;
    // Note: Tắt transition, di chuyển card cuối cùng lên đầu, sau đó tạo hiệu ứng trượt.
    track.classList.add("feature-carousel__track--no-transition");

    const lastChild = track.lastElementChild;

    if (lastChild) {
      track.insertBefore(lastChild, track.firstElementChild);
    }

    // Note: Cập nhật currentCardIndex sau khi di chuyển DOM
    currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
    updatePagination();

    // Note: Đặt vị trí ban đầu để tạo hiệu ứng trượt từ trái sang phải.
    track.style.transform = `translateX(-${stepSize}px)`;
    track.getBoundingClientRect();
    track.classList.remove("feature-carousel__track--no-transition");
    track.style.transform = "translateX(0)";
    // Note: Sau khi hiệu ứng kết thúc, cờ isTransitioning được reset.

    const handleTransitionEnd = () => {
      track.removeEventListener("transitionend", handleTransitionEnd);
      isTransitioning = false;
    };

    track.addEventListener("transitionend", handleTransitionEnd, { once: true });

    // Note: Luôn khởi động lại bộ đếm tự động trượt sau khi người dùng tương tác.
    restartAutoSlide();
  }

  prevButton.addEventListener("click", () => {
    goToPrevious();
  });

  nextButton.addEventListener("click", () => {
    goToNext("manual");
  });

  // Note: Xử lý tạm dừng/tiếp tục tự động trượt khi người dùng tương tác với carousel.
  carousel.addEventListener("mouseenter", pauseAutoSlideForInteraction);
  carousel.addEventListener("mouseleave", resumeAutoSlideAfterInteraction);
  carousel.addEventListener("focusin", pauseAutoSlideForInteraction);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      resumeAutoSlideAfterInteraction();
    }
  });

  // Note: Xử lý khi cửa sổ trình duyệt thay đổi kích thước.
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      syncMetrics();
      lockTransformToZero();
      restartAutoSlide();
    }, 140);
  });

  // Note: Chạy các hàm khởi tạo và bắt đầu tự động trượt.
  syncMetrics();
  updatePagination(); // Note: Khởi tạo pagination dots
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
