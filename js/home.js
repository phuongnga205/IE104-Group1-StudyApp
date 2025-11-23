/*
  File: home.js
  Mô tả: Xử lý điều hướng cho các nút "Khám phá" trên trang chủ.
  Người thực hiện: Lê Ngọc Phương Nga – 23520992
  Ngày cập nhật: 2025-11-23
*/

// Điều hướng người dùng tới quiz theo chủ đề khi nhấn nút "Khám phá".
// Note: Sử dụng IIFE (Immediately Invoked Function Expression) để tạo một scope riêng,
// giúp tránh xung đột biến với các script khác và tự động thực thi khi file được tải.
(() => {
  // Note: Tìm tất cả các nút "Khám phá" trong các thẻ chủ đề (topic-card).
  // Bộ chọn `[data-topic]` đảm bảo chỉ lấy các nút có chứa thông tin về chủ đề.
  const topicButtons = document.querySelectorAll(".topic-card__cta[data-topic]");

  // Note: Lặp qua từng nút đã tìm thấy để gán sự kiện click.
  topicButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Note: Lấy giá trị của thuộc tính `data-topic` (ví dụ: "food", "travel") từ nút được nhấn.
      const topicId = button.dataset.topic;

      // Note: Kiểm tra để chắc chắn rằng topicId có giá trị trước khi điều hướng.
      if (!topicId) {
        return;
      }

      // Note: Chuyển hướng trang sang `quiz.html` và truyền `topicId` qua URL parameter.
      // `encodeURIComponent` được dùng để đảm bảo các ký tự đặc biệt trong topicId không làm hỏng URL.
      window.location.href = `quiz.html?topic=${encodeURIComponent(topicId)}`;
    });
  });
})();
