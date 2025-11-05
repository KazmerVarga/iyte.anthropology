let questions = [];
let currentQuestion = 0;
let score = 0;
const userAnswers = [];
const answerStates = [];

async function loadQuestions() {
  const response = await fetch('questions.json');
  questions = await response.json();
  loadQuestion(currentQuestion);
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  const btn = document.getElementById('themeToggle2');
  btn.textContent = document.body.classList.contains('dark-mode')
    ? 'Switch to Light Mode'
    : 'Switch to Dark Mode';
}

document.getElementById('themeToggle2').addEventListener('click', toggleTheme);

function loadQuestion(index) {
  const q = questions[index];
  const container = document.getElementById("quiz-container");
  container.innerHTML = `
    <div class="card question-container active mb-3" id="question${q.id}">
      <div class="card-body">
        <h5 class="mb-2">Question ${index + 1}</h5>
        <p class="mb-3">${q.text}</p>
        ${q.options.map((opt, i) => `
          <div class="form-check">
            <input class="form-check-input" type="${q.type}" name="q${q.id}" id="q${q.id}_${i}" value="${opt.value}">
            <label class="form-check-label" for="q${q.id}_${i}">${opt.text}</label>
          </div>
        `).join("")}
        <button class="btn btn-light btn-sm mt-3" onclick="submitAnswer(${index})">
          ${index === questions.length - 1 ? 'Show Result' : 'Next'}
        </button>
        <div id="result${q.id}" class="mt-2 small"></div>
      </div>
    </div>
  `;
  renderQuestionNav();
}

function submitAnswer(index) {
  const q = questions[index];
  const inputs = document.querySelectorAll(`input[name='q${q.id}']:checked`);
  const selected = Array.from(inputs).map(input => input.value);
  const resultDiv = document.getElementById(`result${q.id}`);

  if (selected.length === 0) {
    resultDiv.innerHTML = `<span class="text-danger">Select an answer.</span>`;
    return;
  }

  userAnswers[index] = selected;
  const correct = q.correct;
  const isCorrect = selected[0] === correct[0];
  answerStates[index] = isCorrect;

  resultDiv.innerHTML = isCorrect
    ? `<span class="text-success">✔ Correct</span>`
    : `<span class="text-danger">✖ Incorrect</span>`;

  renderQuestionNav();

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) loadQuestion(currentQuestion);
    else showFinalScore();
  }, 1000);
}

function showFinalScore() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = '';
  const finalScore = document.getElementById("finalScore");
  score = answerStates.filter(Boolean).length;
  finalScore.classList.remove("d-none");
  finalScore.innerHTML = `Final Score: <strong>${score} / ${questions.length}</strong>`;
  renderQuestionNav();
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  userAnswers.length = 0;
  answerStates.length = 0;
  document.getElementById("finalScore").classList.add("d-none");
  loadQuestion(currentQuestion);
}

function renderQuestionNav() {
  const nav = document.getElementById("questionNav");
  nav.innerHTML = questions.map((_, i) => `
    <button class="btn ${getNavButtonClass(i)} ${i === currentQuestion ? 'active-question' : ''}" onclick="navigateTo(${i})">${i + 1}</button>
  `).join('');
  const progress = document.getElementById("progressSummary");
  const answeredCount = answerStates.filter(v => v !== undefined).length;
  const correctCount = answerStates.filter(Boolean).length;
  progress.textContent = `Correct: ${correctCount} / ${answeredCount}`;
}

function getNavButtonClass(index) {
  if (answerStates[index] === undefined) return 'btn-outline-secondary';
  return answerStates[index] ? 'btn-success' : 'btn-danger';
}

function navigateTo(index) {
  currentQuestion = index;
  loadQuestion(currentQuestion);
}

window.onload = loadQuestions;
