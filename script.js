// ========== DOM REFERENCE ==========
const app = document.getElementById("app");

// ========== QUIZ DATA ==========
const quizData = [
    {
        question: "Which keyword declares a variable that cannot be reassigned?",
        options: ["var", "let", "const", "function"],
        correctAnswer: 2
    },
    {
        question: "What is the output of: typeof null?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correctAnswer: 2
    },
    {
        question: "Which array method creates a new array by transforming each element?",
        options: ["filter()", "reduce()", "forEach()", "map()"],
        correctAnswer: 3
    },
    {
        question: "What does the spread operator (...) do when used with an array?",
        options: [
            "Deletes all elements",
            "Expands the array into individual elements",
            "Reverses the array",
            "Sorts the array"
        ],
        correctAnswer: 1
    },
    {
        question: "Which of these is the correct arrow function syntax?",
        options: [
            "const fn = () => {}",
            "const fn -> () {}",
            "const fn => () {}",
            "const fn = -> {}"
        ],
        correctAnswer: 0
    },
    {
        question: "What does destructuring allow you to do?",
        options: [
            "Delete object properties",
            "Unpack values from arrays or properties from objects",
            "Merge two arrays together",
            "Convert objects to strings"
        ],
        correctAnswer: 1
    },
    {
        question: "What will `[1, 2, 3].filter(n => n > 1)` return?",
        options: ["[1]", "[2, 3]", "[1, 2, 3]", "[false, true, true]"],
        correctAnswer: 1
    },
    {
        question: "Template literals use which characters for string wrapping?",
        options: ["Single quotes ''", "Double quotes \"\"", "Backticks ``", "Parentheses ()"],
        correctAnswer: 2
    },
    {
        question: "What does `Array.from({length: 3}, (_, i) => i)` return?",
        options: ["[1, 2, 3]", "[0, 1, 2]", "[undefined, undefined, undefined]", "[]"],
        correctAnswer: 1
    },
    {
        question: "Which method reduces an array to a single value?",
        options: ["map()", "filter()", "reduce()", "find()"],
        correctAnswer: 2
    }
];

// ========== SHUFFLE UTILITY ==========
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// ========== STATE VARIABLES ==========
let questions = shuffleArray(quizData);
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

// ========== RENDER: START SCREEN ==========
const renderStartScreen = () => {
    app.innerHTML = `
        <div class="quiz-container">
            <h1>JavaScript Fundamentals Quiz</h1>
            <p class="description">Test your JavaScript knowledge with ${quizData.length} questions</p>
            <button class="btn-start" id="start-btn">Start Quiz</button>
        </div>
    `;

    document.getElementById("start-btn").addEventListener("click", startQuiz);
};

// ========== START QUIZ ==========
const startQuiz = () => {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    renderQuestion();
};

// ========== RENDER: QUESTION SCREEN ==========
const renderQuestion = () => {
    const { question, options } = questions[currentQuestionIndex];

    const optionsHTML = options
        .map(
            (option, index) =>
                `<button class="btn-option" data-index="${index}">${option}</button>`
        )
        .join("");

    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;

    app.innerHTML = `
        <div class="quiz-container">
            <div class="progress-section">
                <span class="progress-text">Question ${currentQuestionIndex + 1} of ${questions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            <h2 class="question-text">${question}</h2>
            <div class="options-container">
                ${optionsHTML}
            </div>
        </div>
    `;

    const buttons = document.querySelectorAll(".btn-option");
    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const selectedIndex = Number(button.dataset.index);
            handleAnswer(selectedIndex, buttons);
        });
    });
};

// ========== HANDLE ANSWER SELECTION ==========
const handleAnswer = (selectedIndex, buttons) => {
    const { correctAnswer } = questions[currentQuestionIndex];

    userAnswers.push(selectedIndex);

    if (selectedIndex === correctAnswer) {
        score++;
    }

    buttons.forEach((button) => {
        const btnIndex = Number(button.dataset.index);

        button.disabled = true;

        if (btnIndex === correctAnswer) {
            button.classList.add("correct");
        }

        if (btnIndex === selectedIndex && selectedIndex !== correctAnswer) {
            button.classList.add("wrong");
        }
    });

    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const nextBtn = document.createElement("button");
    nextBtn.textContent = isLastQuestion ? "See Results" : "Next Question";
    nextBtn.className = "btn-next";

    nextBtn.addEventListener("click", () => {
        if (isLastQuestion) {
            renderResults();
        } else {
            currentQuestionIndex++;
            renderQuestion();
        }
    });

    document.querySelector(".quiz-container").appendChild(nextBtn);
};

// ========== RENDER: RESULTS SCREEN ==========
const renderResults = () => {
    const percentage = Math.round((score / questions.length) * 100);

    const getMessage = (pct) => {
        if (pct < 50) return "Keep practicing! 💪";
        if (pct <= 80) return "Good job! 👍";
        return "Excellent! 🌟";
    };

    const reviewHTML = questions
        .map(({ question, options, correctAnswer }, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === correctAnswer;

            return `
                <div class="review-item ${isCorrect ? "review-correct" : "review-wrong"}">
                    <p class="review-question">
                        <span class="review-icon">${isCorrect ? "✔" : "✘"}</span>
                        ${index + 1}. ${question}
                    </p>
                    <p class="review-answer">
                        Your answer: <strong>${options[userAnswer]}</strong>
                        ${isCorrect ? "" : ` — Correct: <strong>${options[correctAnswer]}</strong>`}
                    </p>
                </div>
            `;
        })
        .join("");

    app.innerHTML = `
        <div class="quiz-container results-container">
            <h1>Quiz Complete!</h1>
            <p class="score-text">You scored <strong>${score}</strong> out of <strong>${questions.length}</strong></p>
            <p class="percentage-text">${percentage}%</p>
            <p class="message-text">${getMessage(percentage)}</p>
            <div class="review-list">
                ${reviewHTML}
            </div>
            <button class="btn-start" id="restart-btn">Restart Quiz</button>
        </div>
    `;

    document.getElementById("restart-btn").addEventListener("click", restartQuiz);
};

// ========== RESTART QUIZ ==========
const restartQuiz = () => {
    questions = shuffleArray(quizData);
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    renderStartScreen();
};

// ========== INITIALIZE APP ==========
renderStartScreen();
