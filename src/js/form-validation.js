/**
 * Модуль утиліт для валідації форм
 * Надає повторно використовувані функції для перевірки полів форми та відображення помилок
 */

/**
 * Показує повідомлення про помилку для поля форми
 * @param {HTMLElement} inputElement - Елемент input/textarea
 * @param {HTMLElement} errorElement - Елемент для відображення повідомлення про помилку
 * @param {string} message - Текст повідомлення про помилку
 */
export function showFieldError(inputElement, errorElement, message) {
  if (inputElement) {
    const errorClass = inputElement.classList.contains('rating-modal__textarea')
      ? 'rating-modal__textarea--error'
      : inputElement.classList.contains('rating-modal__input')
        ? 'rating-modal__input--error'
        : inputElement.classList.contains('footer__subscribe-form-input')
          ? 'footer__subscribe-form-input--error'
          : 'form-field--error';

    inputElement.classList.add(errorClass);
  }

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('form-error--visible');
  }
}

/**
 * Приховує повідомлення про помилку для поля форми
 * @param {HTMLElement} inputElement - Елемент input/textarea
 * @param {HTMLElement} errorElement - Елемент, що відображає повідомлення про помилку
 */
export function hideFieldError(inputElement, errorElement) {
  if (inputElement) {
    inputElement.classList.remove(
      'rating-modal__input--error',
      'rating-modal__textarea--error',
      'footer__subscribe-form-input--error',
      'form-field--error'
    );
  }

  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('form-error--visible');
  }
}

/**
 * Перевіряє коректність електронної адреси
 * @param {string} email - Електронна адреса для перевірки
 * @returns {boolean} true, якщо електронна адреса коректна, інакше false
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Перевіряє, що поле не є порожнім
 * @param {string} value - Значення для перевірки
 * @returns {boolean} true, якщо значення не порожнє, інакше false
 */
export function validateRequired(value) {
  return value.trim().length > 0;
}

// Динамічний рік у футері
document.getElementById('year').textContent = new Date().getFullYear();
