/*
  File: contact.js
  Mô tả: Xử lý validate form liên hệ và lưu thông tin giả lập vào localStorage.
  - Chứa logic xác thực dữ liệu đầu vào (tên, email, nội dung).
  - Cung cấp phản hồi cho người dùng (thông báo lỗi, thông báo thành công).
  - Giả lập việc gửi dữ liệu bằng cách lưu vào bộ nhớ cục bộ của trình duyệt.
  Người thực hiện: Nguyễn Đặng Quang Phúc – 23521204
  Ngày cập nhật: 12/11/2025
*/
document.addEventListener("DOMContentLoaded", () => {
const CONTACT_STORAGE_KEY = "learnie.contacts";

const contactForm = document.getElementById("contactForm");
  const formFeedback = document.getElementById("formFeedback");
  const toastElement = document.getElementById("contactToast");
  let toastTimer = null;

  // Note: Kiểm tra các phần tử DOM cần thiết, nếu thiếu thì dừng thực thi để tránh lỗi.
  if (!contactForm || !formFeedback || !toastElement) return;

  /**
   * Hiển thị thông báo ngay bên dưới form (thường dùng cho lỗi hoặc trạng thái).
   * @param {string} message - Nội dung thông báo.
   * @param {string} type - Loại thông báo ('success' hoặc 'error') để áp dụng class CSS tương ứng.
   */
  function showFormMessage(message = "", type = "") {
    // Note: Reset class về mặc định trước khi thêm class mới.
    formFeedback.textContent = message;
    formFeedback.className = "contact-form__feedback";

    if (message) {
      if (type === "success") {
        formFeedback.classList.add("contact-form__feedback--success");
      } else if (type === "error") {
        formFeedback.classList.add("contact-form__feedback--error");
      }
    }
  }

  /**
   * Hiển thị một thông báo toast (thông báo tạm thời, tự ẩn).
   * @param {string} message - Nội dung cần hiển thị trên toast.
   */
  function showToast(message) {
    toastElement.textContent = message;
    toastElement.classList.add("toast--visible");

    // Note: Nếu đã có một toast đang đếm ngược, hủy nó đi để hiển thị toast mới.
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }

    // Note: Tự động ẩn toast sau 2.8 giây để không làm phiền người dùng.
    toastTimer = window.setTimeout(() => {
      toastElement.classList.remove("toast--visible");
    }, 2800);
  }

  // Kiểm tra email bằng regex đơn giản
  function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  /**
   * Lưu trữ thông tin liên hệ vào localStorage để giả lập việc gửi đi.
   * @param {string} name - Tên người dùng.
   * @param {string} email - Địa chỉ email.
   * @param {string} message - Nội dung tin nhắn.
   */
  function persistContactSubmission(name, email, message) {
    const existingData = JSON.parse(localStorage.getItem(CONTACT_STORAGE_KEY) || "[]");
    const payload = {
      name,
      email,
      message,
      submittedAt: new Date().toLocaleString()
    };

    existingData.push(payload);
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(existingData));
  }

  // Note: Lắng nghe sự kiện 'submit' của form để bắt đầu quá trình xác thực và xử lý.
  contactForm.addEventListener("submit", (event) => {
    // Note: Ngăn chặn hành vi mặc định của form (tải lại trang).
    event.preventDefault();
    
    // Note: Lấy nút submit để có thể vô hiệu hóa trong khi xử lý.
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const fullName = contactForm.name.value.trim();
    const emailAddress = contactForm.email.value.trim();
    const messageContent = contactForm.message.value.trim();

    // === VALIDATION LOGIC ===
    if (!fullName || !emailAddress || !messageContent) {
      showFormMessage("Vui lòng điền đầy đủ thông tin.", "error");
      // Note: Tự động focus vào trường trống đầu tiên để cải thiện trải nghiệm người dùng.
      const firstEmptyField = Array.from(contactForm.elements).find(
        (el) => el.required && !el.value.trim() // Tìm phần tử có 'required' và giá trị rỗng.
      );
      if (firstEmptyField) {
        firstEmptyField.focus();
      }
      return;
    }

    if (!isValidEmail(emailAddress)) {
      showFormMessage("Địa chỉ email không hợp lệ.", "error");
      // Note: Focus vào ô email để người dùng sửa ngay lập tức.
      contactForm.email.focus();
      return;
    }
    
    // === SUBMISSION LOGIC ===
    // Note: Vô hiệu hóa nút gửi và đổi text để thông báo cho người dùng rằng quá trình đang diễn ra.
    // Điều này giúp ngăn chặn việc gửi form nhiều lần.
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Đang gửi...";
    }
    
    // Note: Dùng setTimeout để giả lập độ trễ của mạng (ví dụ: 0.5 giây).
    setTimeout(() => {
      persistContactSubmission(fullName, emailAddress, messageContent);
      contactForm.reset();
      showFormMessage();
      showToast("✅ Cảm ơn bạn! Learnie đã nhận được tin nhắn và sẽ phản hồi trong 24 giờ.");
      // Note: Sau khi xử lý xong, kích hoạt lại nút và trả về văn bản ban đầu.
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Gửi ngay";
      }
    }, 500);
  });
});
