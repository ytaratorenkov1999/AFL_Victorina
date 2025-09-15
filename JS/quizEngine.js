
// Модуль движка викторины
const quizEngine = {

  // Состояние приложения
  state: {
    view: 'home',
    quizzes: [],
    currentQuiz: null,
    index: 0,
    answers: [],
    score: 0,
    showExplanation: false
  },

  // Утилиты
  el(sel) {
    try {
      return document.querySelector(sel);
    } catch (error) {
      console.error('Ошибка поиска элемента:', error);
      return null;
    }
  },

  // Инициализация
  init(quizzes) {
    try {
      if (!Array.isArray(quizzes)) {
        console.warn('Передан не массив викторин');
        return;
      }
      this.state.quizzes = quizzes.filter(quiz =>
        quiz &&
        quiz.id &&
        quiz.questions &&
        Array.isArray(quiz.questions)
      );
      this.render();
    } catch (error) {
      console.error('Ошибка инициализации:', error);
    }
  },

  // Навигация
  setView(view) {
    this.state.view = view;
    this.state.showExplanation = false;
    this.render();
  },

  startQuiz(quizId) {
    try {
      const quiz = this.state.quizzes.find(q => q.id === quizId);
      if (!quiz) {
        console.warn('Викторина не найдена:', quizId);
        return;
      }

      this.state.currentQuiz = JSON.parse(JSON.stringify(quiz));
      this.state.index = 0;
      this.state.answers = Array(quiz.questions.length).fill(null);
      this.state.score = 0;
      this.state.showExplanation = false;

      this.setView('quiz');
    } catch (error) {
      console.error('Ошибка запуска викторины:', error);
    }
  },


  selectAnswer(idx) {
    if (this.state.answers[this.state.index] !== null) return;
    this.state.answers[this.state.index] = idx;
    this.state.showExplanation = true;
    this.render();
  },


  next() {
    if (this.state.answers[this.state.index] == null) return;
    if (this.state.index < this.state.currentQuiz.questions.length - 1) {
      this.state.index++;
      this.state.showExplanation = false;
      this.render();
    } else {
      this.finish();
    }
  },


  prev() {
    if (this.state.index > 0) {
      this.state.index--;
      this.state.showExplanation = false;
      this.render();
    }
  },


  finish() {
    try {
      const { questions } = this.state.currentQuiz;
      let score = 0;
      this.state.answers.forEach((a, i) => {
        if (a === questions[i].correctIndex) score++;
      });
      this.state.score = score;
      this.setView('result');
    } catch (error) {
      console.error('Ошибка завершения викторины:', error);
    }
  },

  goHome() {
    this.setView('home');
  },


  // Рендеринг
  renderHome() {
    if (this.state.quizzes.length === 0) {
      return `
        <h1>Выберите викторину</h1>
        <div class="empty-state">
          <p>Нет доступных викторин</p>
        </div>
      `;
    }

    return `
      <h1>Выберите викторину</h1>
      <div class="grid">
        ${this.state.quizzes.map(q => `
          <div class="quiz-card" onclick="quizEngine.startQuiz('${q.id}')" style="background: linear-gradient(180deg, ${q.color}99, ${q.color}66); border-color: ${q.color}80;">
            <div class="pill" style="background: linear-gradient(90deg, ${q.color}, ${q.color}CC);">${q.questions.length} вопросов</div>
            <h3 style="margin:8px 0 6px; font-size:18px;">${q.title}</h3>
            <p style="margin:0;color:var(--muted); font-size:14px;">Сложность: ${q.difficulty}</p>
          </div>
        `).join('')}
      </div>
      <footer></footer>
    `;
  },


renderQuiz() {
  try {
    const quiz = this.state.currentQuiz;
    const i = this.state.index;
    const q = quiz.questions[i];
    const progress = Math.round(((i) / quiz.questions.length) * 100);
    const selectedAnswer = this.state.answers[i];
    const isCorrect = selectedAnswer === q.correctIndex;

    let explanationText = q.explanation || '';
    // Оставляем оригинальный текст с "Верно:" во время викторины
    if (!isCorrect && this.state.showExplanation && explanationText) {
      explanationText = explanationText.replace(/^Верно:\s*/, '');
      explanationText = 'Неверно: ' + explanationText;
    }

    return `
      <div class="quiz-header">
        <div class="quiz-title-container">
          <h1>${quiz.title}</h1>
          <p class="lead">Вопрос ${i+1} из ${quiz.questions.length} • ${quiz.difficulty}</p>
        </div>
        <div class="home-btn-container">
          <button class="btn ghost" onclick="goHome()" aria-label="На главную">На главную</button>
        </div>
      </div>

      <div class="progress" aria-label="Прогресс"><div class="bar" style="width:${progress}%"></div></div>

      <div class="question">${q.text}</div>

      ${q.image ? `<img src="${q.image}" alt="Иллюстрация к вопросу" class="question-image" onerror="this.style.display='none'" loading="lazy">` : ''}

      <div class="answers">
        ${q.options.map((opt, idx) => {
          let classes = "answer";
          if (this.state.answers[i] !== null) {
            if (idx === q.correctIndex) classes += " correct";
            else if (idx === this.state.answers[i] && idx !== q.correctIndex) classes += " wrong";
          }

          return `<button class="${classes}" onclick="selectAnswer(${idx})" ${this.state.answers[i] !== null ? 'disabled' : ''}
                    aria-label="${opt} ${this.state.answers[i] === idx ? 'выбрано' : ''}">
                    <span>${opt}</span>
                    ${this.state.answers[i] === idx ? '<span class="tag">Выбрано</span>' : ''}
                  </button>`
        }).join('')}
      </div>

      ${this.state.showExplanation && explanationText ? `
        <div class="explanation ${isCorrect ? 'correct' : 'wrong'}">
          ${explanationText}
        </div>
      ` : ''}

      <div class="row" style="margin-top:20px">
        <div class="nav-row">
          <button class="btn nav-btn" onclick="prev()" ${i===0?'disabled':''} aria-label="Предыдущий вопрос">
            Назад
          </button>
          ${i < quiz.questions.length-1
            ? `<button class="btn nav-btn" onclick="next()" ${this.state.answers[i]==null?'disabled':''}
                 aria-label="Следующий вопрос">Далее</button>`
            : `<button class="btn nav-btn" onclick="finish()" ${this.state.answers[i]==null?'disabled':''}
                 aria-label="Завершить викторину">Завершить</button>`}
        </div>
      </div>
    `;
  } catch (e) {
    return `
      <div class="error-state">
        <h1>Произошла ошибка</h1>
        <button class="btn" onclick="goHome()">Вернуться на главную</button>
      </div>
    `;
  }
},


  renderResult() {
    try {
      const { currentQuiz, score, answers } = this.state;
      const total = currentQuiz.questions.length;
      const pct = Math.round(score/total*100);
      let emoji = '🙂'; if(pct>=80) emoji='🎉'; else if(pct<50) emoji='🤔';

      return `
        <div class="row">
          <h1>Результат — ${currentQuiz.title}</h1>
          <button class="btn ghost" onclick="goHome()">На главную</button>
        </div>
        <div class="result">
          <div class="score">${emoji} ${score} / ${total} правильных (${pct}%)</div>
          <div class="tag">Сложность: ${currentQuiz.difficulty}</div>
          <div style="display:flex; gap:8px; margin-top:6px">
            <button class="btn" onclick="startQuiz('${currentQuiz.id}')">Пройти снова</button>
            <button class="btn ghost" onclick="goHome()">Выбрать другую</button>
          </div>
        </div>
        <details style="margin-top:18px">
          <summary style="cursor:pointer">Показать разбор ответов</summary>
          <div style="margin-top:12px; display:grid; gap:10px">
            ${currentQuiz.questions.map((q, i) => {
              const ok = answers[i] === q.correctIndex;
              const explanation = q.explanation || '';


              const cleanExplanation = explanation.replace(/^Верно:\s*/, '');

              return `<div class="answer ${ok?'correct':'wrong'}">
                        <div>
                          <div style="font-weight:700">Вопрос ${i+1}.</div>
                          <div style="color:var(--muted)">${q.text}</div>
                        </div>
                        <div style="text-align:right">
                          <div class="tag" style="${ok?'color:var(--ok)':'color:var(--err)'}">${ok?'Верно':'Неверно'}</div>
                        </div>
                        ${cleanExplanation ? `
                        <div class="explanation ${ok?'correct':'wrong'}" style="grid-column: 1 / -1; margin-top: 10px;">
                          ${cleanExplanation}
                        </div>
                        ` : ''}
                      </div>`
            }).join('')}
          </div>
        </details>
      `;
    } catch (e) {
      return `
        <div class="error-state">
          <h1>Произошла ошибка</h1>
          <button class="btn" onclick="goHome()">Вернуться на главную</button>
        </div>
      `;
    }
  },

  render() {
    try {
      const app = this.el('#app');
      if (!app) return;

      app.innerHTML = (
        this.state.view === 'home'   ? this.renderHome()   :
        this.state.view === 'quiz'   ? this.renderQuiz()   :
        this.renderResult()
      );
    } catch (error) {
      console.error('Ошибка рендеринга:', error);
    }
  }
};

// Делаем доступным глобально
window.quizEngine = quizEngine;

// Глобальные функции для HTML
window.startQuiz = (quizId) => quizEngine.startQuiz(quizId);
window.selectAnswer = (idx) => quizEngine.selectAnswer(idx);
window.next = () => quizEngine.next();
window.prev = () => quizEngine.prev();
window.finish = () => quizEngine.finish();
window.goHome = () => quizEngine.goHome();