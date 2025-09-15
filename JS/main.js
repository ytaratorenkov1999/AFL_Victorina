// Главный скрипт инициализации
document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем движок викторины
  if (window.quizEngine && window.QUIZZES) {
    quizEngine.init(QUIZZES);
  }
  
  // Делаем функции доступными глобально для onclick атрибутов
  window.startQuiz = (quizId) => quizEngine.startQuiz(quizId);
  window.goHome = () => quizEngine.goHome();
  window.selectAnswer = (idx) => quizEngine.selectAnswer(idx);
  window.next = () => quizEngine.next();
  window.prev = () => quizEngine.prev();
  window.finish = () => quizEngine.finish();
});