/*
  File: home.js
  Mô tả: Xử lý điều hướng cho các nút "Khám phá" trên trang chủ.
  Người thực hiện: Lê Ngọc Phương Nga – hỗ trợ cập nhật chức năng redirect quiz.
  Ngày cập nhật: 2025-11-10
*/

// Điều hướng người dùng tới quiz theo chủ đề khi nhấn nút "Khám phá".
(() => {
  const topicButtons = document.querySelectorAll(".topic-card__cta[data-topic]");

  topicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const topicId = button.dataset.topic;

      if (!topicId) {
        return;
      }

      window.location.href = `quiz.html?topic=${encodeURIComponent(topicId)}`;
    });
  });
})();
