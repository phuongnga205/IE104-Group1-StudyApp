/*
  File: quiz.js
  Mô tả: Dữ liệu câu hỏi và logic quiz Learnie.
  Người thực hiện: Nguyễn Đặng Quang Phúc – 23521204
  Ngày cập nhật: 09/11/2025
*/

// Note: Lấy topic qua query param để một trang quiz phục vụ nhiều chủ đề khác nhau
const queryParams = new URLSearchParams(window.location.search);
const topicId = queryParams.get("topic") || "food";

// Note: Toàn bộ ngân hàng câu hỏi chia theo chủ đề để dễ tái sử dụng
const quizBank = {
  food: [
    {
      type: "mcq",
      question: "What is 'phở' in English?",
      choices: ["Rice noodle soup", "Bread", "Pizza", "Sushi"],
      correctIndex: 0,
      explain: "'Phở' means rice noodle soup."
    },
    {
      type: "mcq",
      question: "Which one is a fruit?",
      choices: ["Carrot", "Banana", "Potato", "Broccoli"],
      correctIndex: 1,
      explain: "Banana is a fruit, others are vegetables."
    },
    {
      type: "fill",
      question: "I would like a ___ of tea, please.",
      correctAnswer: "cup",
      explain: "A cup of tea = một tách trà."
    },
    {
      type: "mcq",
      question: "What do you usually eat for breakfast?",
      choices: ["Rice", "Bread", "Soup", "Ice cream"],
      correctIndex: 1,
      explain: "Bread is common for breakfast."
    },
    {
      type: "fill",
      question: "This soup is very ___. I like it!",
      correctAnswer: "delicious",
      explain: "Delicious = ngon miệng."
    }
  ],
  travel: [
    {
      type: "mcq",
      question: "What does 'passport' mean?",
      choices: ["Hộ chiếu", "Vé máy bay", "Bản đồ", "Thị thực"],
      correctIndex: 0,
      explain: "'Passport' means hộ chiếu."
    },
    {
      type: "fill",
      question: "Where is the ___ station?",
      correctAnswer: "bus",
      explain: "Bus station = bến xe buýt."
    },
    {
      type: "mcq",
      question: "We go to the airport to take a ___",
      choices: ["train", "plane", "bus", "taxi"],
      correctIndex: 1,
      explain: "You take a plane at the airport."
    },
    {
      type: "mcq",
      question: "Which country is famous for the Eiffel Tower?",
      choices: ["France", "Japan", "Italy", "China"],
      correctIndex: 0,
      explain: "The Eiffel Tower is in France."
    },
    {
      type: "fill",
      question: "I need a ___ to travel to another country.",
      correctAnswer: "visa",
      explain: "Visa = thị thực."
    }
  ],
  animals: [
    {
      type: "mcq",
      question: "Which one is a mammal?",
      choices: ["Eagle", "Fish", "Dog", "Snake"],
      correctIndex: 2,
      explain: "Dog is a mammal."
    },
    {
      type: "fill",
      question: "A ___ can fly in the sky.",
      correctAnswer: "bird",
      explain: "A bird can fly."
    },
    {
      type: "mcq",
      question: "Which animal says 'meow'?",
      choices: ["Dog", "Cat", "Cow", "Duck"],
      correctIndex: 1,
      explain: "Cats say 'meow'."
    },
    {
      type: "mcq",
      question: "What is 'voi' in English?",
      choices: ["Elephant", "Lion", "Horse", "Monkey"],
      correctIndex: 0,
      explain: "'Voi' means elephant."
    },
    {
      type: "fill",
      question: "The ___ is the king of the jungle.",
      correctAnswer: "lion",
      explain: "Lion = sư tử."
    }
  ],
  business: [
    {
      type: "mcq",
      question: "What does 'meeting' mean?",
      choices: ["Cuộc họp", "Tiền lương", "Khách hàng", "Công việc"],
      correctIndex: 0,
      explain: "'Meeting' = cuộc họp."
    },
    {
      type: "fill",
      question: "My boss is very ___. He works hard every day.",
      correctAnswer: "busy",
      explain: "Busy = bận rộn."
    },
    {
      type: "mcq",
      question: "What do you use to send a message to your colleague?",
      choices: ["Breakfast", "Email", "Coffee", "Printer"],
      correctIndex: 1,
      explain: "You send messages by email."
    },
    {
      type: "fill",
      question: "I have a job ___ at 9 AM tomorrow.",
      correctAnswer: "interview",
      explain: "Job interview = buổi phỏng vấn xin việc."
    },
    {
      type: "mcq",
      question: "What does 'salary' mean?",
      choices: ["Công ty", "Lương", "Khách hàng", "Dự án"],
      correctIndex: 1,
      explain: "'Salary' = tiền lương."
    }
  ],
  sports: [
    {
      type: "mcq",
      question: "What is 'bóng đá' in English?",
      choices: ["Tennis", "Football", "Volleyball", "Basketball"],
      correctIndex: 1,
      explain: "'Bóng đá' = Football (soccer)."
    },
    {
      type: "fill",
      question: "I like to swim in the ___.",
      correctAnswer: "pool",
      explain: "Swimming pool = hồ bơi."
    },
    {
      type: "mcq",
      question: "Which sport uses a racket?",
      choices: ["Tennis", "Boxing", "Football", "Golf"],
      correctIndex: 0,
      explain: "Tennis uses a racket."
    },
    {
      type: "fill",
      question: "He runs very fast. He is a good ___.",
      correctAnswer: "runner",
      explain: "Runner = vận động viên chạy."
    },
    {
      type: "mcq",
      question: "How many players are there in a football team?",
      choices: ["9", "10", "11", "12"],
      correctIndex: 2,
      explain: "A football team has 11 players."
    }
  ],
  tech: [
    {
      type: "mcq",
      question: "What is 'máy tính' in English?",
      choices: ["Computer", "Phone", "Television", "Camera"],
      correctIndex: 0,
      explain: "'Máy tính' = Computer."
    },
    {
      type: "fill",
      question: "You can search for information on the ___.",
      correctAnswer: "internet",
      explain: "Search on the Internet = tìm kiếm trên mạng."
    },
    {
      type: "mcq",
      question: "Which device do you use to make a phone call?",
      choices: ["Keyboard", "Monitor", "Smartphone", "Printer"],
      correctIndex: 2,
      explain: "You call using a smartphone."
    },
    {
      type: "fill",
      question: "A ___ helps store data and files.",
      correctAnswer: "hard drive",
      explain: "Hard drive = ổ cứng lưu trữ dữ liệu."
    },
    {
      type: "mcq",
      question: "What does 'email' mean?",
      choices: ["Thư điện tử", "Tin nhắn", "Tập tin", "Tài khoản"],
      correctIndex: 0,
      explain: "'Email' = thư điện tử."
    }
  ]
};

// Note: Map key kỹ thuật sang tên hiển thị để cập nhật tiêu đề người dùng dễ hiểu
function getReadableTopicName(topicKey) {
  const readableTopics = {
    food: "Đồ ăn & Thức uống",
    travel: "Du lịch",
    animals: "Động vật",
    business: "Kinh doanh",
    sports: "Thể thao",
    tech: "Công nghệ"
  };

  return readableTopics[topicKey] || "Chủ đề chung";
}

// Note: Nếu topic không tồn tại thì dùng bộ food để trang không bị lỗi
const quizData = quizBank[topicId] || quizBank.food;
// Note: Điểm tối đa cố định 100, câu hỏi ít hay nhiều đều scale theo biến bên dưới
const MAX_SCORE = 100;
// Note: Điểm mỗi câu tính động để thêm bớt câu không cần sửa logic
const POINTS_PER_QUESTION = MAX_SCORE / quizData.length;
// Note: Lưu best score theo từng chủ đề nên cần prefix riêng
const BEST_SCORE_KEY_PREFIX = "bestScore_";

// Note: Giữ điểm gọn (không thập phân nếu điểm tròn)
function formatScore(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
// Note: Các biến giữ trạng thái động của quiz theo từng câu hỏi
let currentQuestionIndex = 0;
let totalScore = 0;
let selectedChoiceIndex = null;
let hasCheckedCurrentQuestion = false;

// Note: Cache toàn bộ phần tử DOM cần thao tác để tránh document.getElementById lặp lại
const topicTitleElement = document.getElementById("quizTopicTitle");
const questionIndexElement = document.getElementById("quizQuestionIndex");
const scoreElement = document.getElementById("quizScore");
const questionTextElement = document.getElementById("quizQuestionText");
const responseContainer = document.getElementById("quizResponseArea");
const resultTitleElement = document.getElementById("quizResultTitle");
const resultDescriptionElement = document.getElementById("quizResultDescription");
const resultActionsElement = document.getElementById("quizResultActions");
let inputField = null;
// Note: Khóa localStorage ghép topic để lưu điểm cao cho từng chủ đề
const bestKey = `${BEST_SCORE_KEY_PREFIX}${topicId}`;
const checkAnswerButton = document.getElementById("checkAnswerBtn");
const feedbackElement = document.getElementById("quizFeedback");
const nextQuestionButton = document.getElementById("nextQuestionBtn");
const quizCardElement = document.getElementById("quizCard");
const quizResultElement = document.getElementById("quizResult");
const finalScoreElement = document.getElementById("finalScoreText");
const bestScoreElement = document.getElementById("bestScoreText");
const restartQuizButton = document.getElementById("restartQuizBtn");
const quizWrapperElement = document.querySelector(".quiz-wrapper");

// Chuẩn bị âm thanh phản hồi cho quiz (đúng, sai, hoàn thành)
const quizAudioPlayers = {
  // Note: Giảm âm lượng âm thanh "đúng" xuống 70% để tránh bị giật mình.
  correct: createAudioPlayer("audio/quiz-correct.wav", 0.7),
  // Note: Âm thanh "sai" giữ ở mức tối đa 100% vì file gốc hơi nhỏ.
  wrong: createAudioPlayer("audio/quiz-wrong.wav", 1.0),
  // Note: Âm thanh "hoàn thành" ở mức 80% là vừa phải.
  complete: createAudioPlayer("audio/quiz-complete.wav", 0.8)
};

// Note: Tạo sẵn Audio element để tránh delay khi người dùng trả lời
// Note: Thêm tham số volume để tùy chỉnh âm lượng cho từng loại âm thanh.
function createAudioPlayer(sourcePath, volume = 1.0) {
  const audio = new Audio(sourcePath);
  audio.preload = "auto";
  // Note: volume nhận giá trị từ 0.0 (tắt tiếng) đến 1.0 (to nhất).
  audio.volume = volume;
  return audio;
}

// Note: Mỗi sự kiện dùng 1 âm thanh tương ứng (đúng/sai/hoàn thành)
function playQuizSound(type) {
  const player = quizAudioPlayers[type];

  if (!player) {
    return;
  }

  // Note: Reset âm thanh về đầu trước khi phát lại để đảm bảo âm thanh luôn bắt đầu từ đầu.
  player.currentTime = 0;
  const playPromise = player.play();

  // Note: Trình duyệt hiện đại trả về một Promise khi play(). Xử lý lỗi để tránh
  // cảnh báo "Uncaught (in promise)" trên console, thường xảy ra khi người dùng
  // chưa tương tác với trang và trình duyệt chặn tự động phát media.
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.warn("Không thể tự động phát âm thanh quiz:", error);
    });
  }
}

// Note: Khi load trang thì cập nhật tiêu đề để người học biết chủ đề mình đang luyện
function updateTopicTitle() {
  if (topicTitleElement) {
    topicTitleElement.textContent = `Chủ đề: ${getReadableTopicName(topicId)}`;
  }
}

// Hiển thị câu hỏi hiện tại và thiết lập trạng thái ban đầu
function renderCurrentQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];

  // Note: Mỗi lần render phải reset lựa chọn và trạng thái nút để tránh kế thừa từ câu trước
  selectedChoiceIndex = null;
  hasCheckedCurrentQuestion = false;
  nextQuestionButton.disabled = true;
  nextQuestionButton.classList.add("quiz-card__next--hidden");
  checkAnswerButton.disabled = false;

  questionIndexElement.textContent = `Câu\u00A0hỏi ${currentQuestionIndex + 1} / ${quizData.length}`;
  scoreElement.textContent = `Điểm: ${formatScore(totalScore)} / ${MAX_SCORE}`;
  questionTextElement.textContent = currentQuestion.question;

  // Note: Xóa sạch vùng phản hồi/feedback để chuẩn bị cho câu mới
  responseContainer.innerHTML = "";
  inputField = null;
  feedbackElement.hidden = true;
  feedbackElement.textContent = "";
  feedbackElement.className = "quiz-feedback";

  if (currentQuestion.type === "mcq") {
    renderMultipleChoiceOptions(currentQuestion);
  } else {
    setupFillInInput(currentQuestion);
  }
}

// Render danh sách đáp án trắc nghiệm và cho phép chọn trước khi kiểm tra
function renderMultipleChoiceOptions(question) {
  const optionsWrapper = document.createElement("div");
  optionsWrapper.className = "quiz-options";
  optionsWrapper.setAttribute("role", "group");
  optionsWrapper.setAttribute("aria-label", "Danh sách đáp án trắc nghiệm");

  question.choices.forEach((choiceText, index) => {
    const optionButton = document.createElement("button");
    optionButton.className = "quiz-option-btn";
    optionButton.type = "button";
    optionButton.textContent = choiceText;

    // Note: Chỉ cho phép chọn trước khi kiểm tra để giữ trải nghiệm kiểu trắc nghiệm giấy
    optionButton.addEventListener("click", () => {
      if (hasCheckedCurrentQuestion) return;

      selectedChoiceIndex = index;

      // Note: Bỏ highlight các nút khác để đảm bảo chỉ có một lựa chọn tại một thời điểm
      const allButtons = optionsWrapper.querySelectorAll(".quiz-option-btn");
      allButtons.forEach((button) => button.classList.remove("quiz-option-btn--selected"));
      optionButton.classList.add("quiz-option-btn--selected");
    });

    optionsWrapper.appendChild(optionButton);
  });

  responseContainer.appendChild(optionsWrapper);
}

// Chuẩn bị ô nhập cho câu hỏi điền từ
function setupFillInInput(question) {
  const inputWrapper = document.createElement("div");
  inputWrapper.className = "quiz-input";

  const hintElement = document.createElement("p");
  hintElement.className = "quiz-input__hint";
  // Note: Hint giúp học viên nhớ yêu cầu mà không cần xem đáp án
  hintElement.textContent = question.hint || "Nhập câu trả lời của bạn";

  const labelElement = document.createElement("label");
  labelElement.className = "visually-hidden";
  labelElement.setAttribute("for", "quizUserAnswer");
  labelElement.textContent = "Câu trả lời của bạn";

  inputField = document.createElement("input");
  inputField.className = "quiz-input__field";
  inputField.type = "text";
  inputField.id = "quizUserAnswer";
  inputField.placeholder = "Nhập câu trả lời của bạn...";

  // Note: Enter = kiểm tra nhanh, nên chặn submit form ngoài ý muốn
  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCheckAnswer();
    }
  });

  inputWrapper.appendChild(hintElement);
  inputWrapper.appendChild(labelElement);
  inputWrapper.appendChild(inputField);

  responseContainer.appendChild(inputWrapper);

  inputField.focus();
}

// Xác nhận đáp án khi người học bấm nút "Kiểm tra"
function handleCheckAnswer() {
  // Note: Không cho kiểm tra lại cùng câu để tránh cộng điểm nhiều lần
  if (hasCheckedCurrentQuestion) return;

  const currentQuestion = quizData[currentQuestionIndex];
  let isCorrect = false;
  let explanationText = currentQuestion.explain;
  let answerEvaluated = false;

  if (currentQuestion.type === "mcq") {
    const allButtons = responseContainer.querySelectorAll(".quiz-option-btn");

    if (selectedChoiceIndex === null) {
      // Note: Bắt buộc người dùng chọn đáp án trước khi chấm
      displayFeedback(false, "Hãy chọn đáp án trước khi kiểm\u00A0tra.");
      return;
    }

    allButtons.forEach((button, index) => {
      button.disabled = true;
      if (index === currentQuestion.correctIndex) {
        button.classList.add("quiz-option-btn--correct");
      } else {
        button.classList.remove("quiz-option-btn--correct", "quiz-option-btn--wrong", "quiz-option-btn--selected");
      }
    });

    if (selectedChoiceIndex !== currentQuestion.correctIndex) {
      const selectedButton = allButtons[selectedChoiceIndex];
      selectedButton.classList.add("quiz-option-btn--wrong");
    }

    isCorrect = selectedChoiceIndex === currentQuestion.correctIndex;
    answerEvaluated = true;
  } else {
    if (!inputField) {
      displayFeedback(false, "Không tìm thấy ô nhập câu trả lời.");
      return;
    }

    // Note: So sánh không phân biệt hoa thường để tránh bắt lỗi chính tả không cần thiết
    const userAnswer = inputField.value.trim().toLowerCase();
    if (!userAnswer) {
      displayFeedback(false, "Hãy nhập câu\u00A0trả lời trước khi kiểm\u00A0tra.");
      return;
    }

    inputField.disabled = true;

    const correctAnswer = currentQuestion.correctAnswer.trim().toLowerCase();
    isCorrect = userAnswer === correctAnswer;
    answerEvaluated = true;
  }

  // Note: Điểm luôn bị chặn ở MAX_SCORE tránh vượt quá 100 khi dữ liệu lỗi
  if (isCorrect) {
    totalScore = Math.min(MAX_SCORE, totalScore + POINTS_PER_QUESTION);
  }

  if (answerEvaluated) {
    playQuizSound(isCorrect ? "correct" : "wrong");
  }

  displayFeedback(isCorrect, explanationText);
  hasCheckedCurrentQuestion = true;
  nextQuestionButton.disabled = false;
  nextQuestionButton.classList.remove("quiz-card__next--hidden");
  checkAnswerButton.disabled = true;
  scoreElement.textContent = `Điểm: ${formatScore(totalScore)} / ${MAX_SCORE}`;
}

// Hiển thị thông báo đúng/sai và giải thích
function displayFeedback(isCorrect, explanationText) {
  // Note: Luôn reset nội dung/ class để tránh dính style của câu trước
  feedbackElement.hidden = false;
  feedbackElement.textContent = "";
  feedbackElement.className = "quiz-feedback";

  const messageLine = document.createElement("div");
  messageLine.textContent = isCorrect ? "Chính\u00A0xác! ✅" : "Chưa\u00A0đúng ❌";

  const explanationLine = document.createElement("div");
  explanationLine.className = "quiz-feedback__explain";
  explanationLine.textContent = explanationText;

  feedbackElement.appendChild(messageLine);
  feedbackElement.appendChild(explanationLine);
  feedbackElement.classList.add(isCorrect ? "quiz-feedback--correct" : "quiz-feedback--wrong");
}

// Chuyển sang câu tiếp theo sau khi đã kiểm tra
function goToNextQuestion() {
  // Note: Bắt buộc kiểm tra câu hiện tại trước khi đổi để giữ flow học tập
  if (!hasCheckedCurrentQuestion) {
    displayFeedback(false, "Hãy bấm Kiểm\u00A0tra trước khi sang câu\u00A0mới.");
    return;
  }

  currentQuestionIndex += 1;

  if (currentQuestionIndex < quizData.length) {
    renderCurrentQuestion();
  } else {
    finishQuiz();
  }
}

// Kết thúc quiz, cập nhật điểm cao nhất và hiện kết quả
function finishQuiz() {
  // Note: Ẩn card câu hỏi và hiển thị ô kết quả
  quizCardElement.hidden = true;
  if (quizResultElement) {
    quizResultElement.classList.add("quiz-result--visible");
  }
  if (quizWrapperElement) {
    // Note: Khi hoàn thành chỉ còn card kết quả, xóa class quiz-only và thêm single
    quizWrapperElement.classList.remove("quiz-wrapper--quiz-only");
    quizWrapperElement.classList.add("quiz-wrapper--single");
  }
  finalScoreElement.hidden = false;
  resultDescriptionElement.hidden = false;
  resultActionsElement.hidden = false;

  if (resultTitleElement) {
    resultTitleElement.textContent = "Hoàn\u00A0thành 🎉";
  }

  finalScoreElement.textContent = `Điểm: ${formatScore(totalScore)} / ${MAX_SCORE}`;

  // Note: Lấy điểm cao cũ trong localStorage để so sánh
  const previousBest = Number(localStorage.getItem(bestKey) || 0);
  const newBest = Math.max(previousBest, totalScore);

  // Note: Lưu lại nếu người học lập kỷ lục mới
  localStorage.setItem(bestKey, String(newBest));

  if (bestScoreElement) {
    bestScoreElement.textContent = `Điểm\u00A0cao nhất của bạn: ${formatScore(newBest)} / ${MAX_SCORE}`;
  }

  playQuizSound("complete");
}

// Đặt lại quiz để làm lại từ đầu
function restartQuiz() {
  // Note: Reset mọi biến trạng thái để lượt chơi mới sạch hoàn toàn
  currentQuestionIndex = 0;
  totalScore = 0;
  selectedChoiceIndex = null;
  hasCheckedCurrentQuestion = false;
  inputField = null;

  // Note: Ẩn ô kết quả và hiển thị lại card câu hỏi
  if (quizResultElement) {
    quizResultElement.classList.remove("quiz-result--visible");
  }
  quizCardElement.hidden = false;
  if (quizWrapperElement) {
    // Note: Bỏ class single và thêm quiz-only để căn giữa quiz card
    quizWrapperElement.classList.remove("quiz-wrapper--single");
    quizWrapperElement.classList.add("quiz-wrapper--quiz-only");
  }
  renderCurrentQuestion();
}

// Hiển thị panel kết quả ở trạng thái chỉ có điểm cao nhất
// Note: Trang tải lên đã khoe điểm tốt nhất để tăng động lực
function showInitialResultPanel() {
  const storedBest = Number(localStorage.getItem(bestKey) || 0);

  if (resultTitleElement) {
    resultTitleElement.textContent = "Điểm\u00A0cao nhất";
  }

  if (bestScoreElement) {
    bestScoreElement.textContent = `Điểm\u00A0cao nhất của bạn: ${formatScore(storedBest)} / ${MAX_SCORE}`;
  }

  if (finalScoreElement) {
    finalScoreElement.hidden = true;
  }

  if (resultDescriptionElement) {
    resultDescriptionElement.hidden = true;
  }

  if (resultActionsElement) {
    resultActionsElement.hidden = true;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Note: Kiểm tra đủ phần tử UI trước khi chạy để tránh lỗi null khi render
  const essentialElements = [
    questionIndexElement,
    scoreElement,
    questionTextElement,
    responseContainer,
    feedbackElement,
    checkAnswerButton,
    nextQuestionButton,
    quizCardElement,
    quizResultElement,
    finalScoreElement,
    restartQuizButton,
    bestScoreElement,
    resultTitleElement,
    resultDescriptionElement,
    resultActionsElement
  ];

  const hasMissingElement = essentialElements.some((element) => !element);
  if (hasMissingElement) {
    console.error("Quiz UI chưa được khởi tạo đầy đủ.");
    return;
  }

  // Note: Trình tự khởi tạo: cập nhật tên chủ đề -> đảm bảo ô kết quả bị ẩn -> căn giữa quiz card -> render câu đầu
  updateTopicTitle();
  // Note: Đảm bảo ô kết quả bị ẩn khi bắt đầu làm quiz
  if (quizResultElement) {
    quizResultElement.classList.remove("quiz-result--visible");
  }
  // Note: Thêm class để căn giữa quiz card khi đang làm quiz
  if (quizWrapperElement) {
    quizWrapperElement.classList.remove("quiz-wrapper--single");
    quizWrapperElement.classList.add("quiz-wrapper--quiz-only");
  }
  renderCurrentQuestion();

  checkAnswerButton.addEventListener("click", handleCheckAnswer);
  nextQuestionButton.addEventListener("click", goToNextQuestion);
  restartQuizButton.addEventListener("click", restartQuiz);
});
