// ========== DOM REFERENCE ==========
const app = document.getElementById("app");

// ========== SANITIZE UTILITY ==========
const sanitizeHTML = (str) => {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
};

// ========== STATE VARIABLES ===========
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let isAnswered = false;


const fetchQuestions = async () => {
    try{
        const response = await fetch("https://opentdb.com/api.php?amount=10&category=18&difficulty=easy&type=multiple");

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return [];
        }

        const formattedQuestions = data.results.map((loadedQuestion) => {
            const formattedOptions = [...loadedQuestion.incorrect_answers];

            const correctIndex = Math.floor(Math.random() * (formattedOptions.length + 1));
            formattedOptions.splice(correctIndex, 0, loadedQuestion.correct_answer);

            return {
                question: loadedQuestion.question,
                options: formattedOptions,
                correctAnswer: correctIndex
            }
        })
        return formattedQuestions;
    }
    catch (error) {
        console.error("Error fetching questions:", error);
        alert("Failed to load questions. Please try again later.");
        return [];
    }
};





// ========== RENDER: START SCREEN ==========
const renderStartScreen = () => {
    app.innerHTML = `
        <div class="quiz-container">
            <h1>JavaScript Fundamentals Quiz</h1>
            <p class="description">Test your JavaScript knowledge with 10 questions</p>
            <button class="btn-start" id="start-btn">Start Quiz</button>
        </div>
    `;

    document.getElementById("start-btn").addEventListener("click", startQuiz);
};

// ========== START QUIZ (Now Async!) ==========
const startQuiz = async () => {
    // 1. Show a loading state so the user knows something is happening
    app.innerHTML = `
        <div class="quiz-container">
            <h2>Loading questions from the database... ⏳</h2>
        </div>
    `;

    // 2. Pause execution here and wait for the fetch to complete
    const fetchedData = await fetchQuestions();

    // 3. Update our state variables
    questions = fetchedData;
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];

    // 4. Render the first question once data is ready
    if (questions.length > 0) {
        renderQuestion();
    }
    else {
        alert("No questions found. Please try again later.");
        renderStartScreen();
    }
};

// ========== RENDER: QUESTION SCREEN ==========
const renderQuestion = () => {
    isAnswered = false;
    const { question, options } = questions[currentQuestionIndex];

    const optionsHTML = options
        .map(
            (option, index) =>
                `<button class="btn-option" data-index="${index}">${sanitizeHTML(option)}</button>`
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
            <h2 class="question-text">${sanitizeHTML(question)}</h2>
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
    if (isAnswered) return;
    isAnswered = true;

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
                        ${index + 1}. ${sanitizeHTML(question)}
                    </p>
                    <p class="review-answer">
                        Your answer: <strong>${sanitizeHTML(options[userAnswer])}</strong>
                        ${isCorrect ? "" : ` — Correct: <strong>${sanitizeHTML(options[correctAnswer])}</strong>`}
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
    // Just send them back to the start screen
    renderStartScreen();
};

// ========== INITIALIZE APP ==========
renderStartScreen();
