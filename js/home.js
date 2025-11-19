/*
  File: home.js
  Mô tả: Xử lý điều hướng cho các nút "Khám phá" trên trang chủ.
  Người thực hiện: Lê Ngọc Phương Nga - 23520992
  Ngày cập nhật: 2025-11-19
*/

// Điều hướng người dùng tới quiz theo chủ đề khi nhấn nút "Khám phá".
(() => {
  // Lấy tất cả nút "Khám phá" có gắn data-topic
  const topicButtons = document.querySelectorAll(".topic-card__cta[data-topic]");

  // Lặp qua từng nút để gắn sự kiện click
  topicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Lấy tên chủ đề từ thuộc tính data-topic
      const topicId = button.dataset.topic;

      // Nếu không có topic (không xảy ra trong thiết kế, nhưng kiểm tra cho an toàn)
      if (!topicId) {
        return;
      }

      // Chuyển hướng sang trang quiz 
      window.location.href = `quiz.html?topic=${encodeURIComponent(topicId)}`;
    });
  });
})();
