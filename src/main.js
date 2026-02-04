import {
  loadExerciseCards,
  updateBreadcrumbs,
  initSearch,
  initCardsEventListener,
  initHashtags,
} from './js/exercises.js';
import { initExerciseModal, closeExerciseModal } from './js/exercise-modal.js';
import { initRatingModal, closeRatingModal } from './js/rating-modal.js';
import {
  initGlobalNotification,
  showGlobalNotification,
} from './js/global-notification.js';
import {
  showFieldError,
  hideFieldError,
  validateEmail,
} from './js/form-validation.js';
import { initFooterSubscription } from './js/email-validation.js';
import { initHeader } from './js/header.js';
import { displayQuote } from './js/quote.js';


displayQuote();


document.addEventListener('DOMContentLoaded', () => {
  initExerciseModal();
  initRatingModal();

  initGlobalNotification();

  initHeader();

  initSearch();

  initCardsEventListener();

  initHashtags();

  initFooterSubscription();

  loadExerciseCards('Muscles', 1);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeExerciseModal();
      closeRatingModal();
    }
  });

  const filterButtons = document.querySelectorAll(
    '.exercises__content__header-filters-item'
  );

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {      
      filterButtons.forEach(btn =>
        btn.classList.remove('exercises__content__header-filters-item--active')
      );

      button.classList.add('exercises__content__header-filters-item--active');

      const filter = button.getAttribute('data-filter');
      updateBreadcrumbs(null);

      loadExerciseCards(filter, 1);
    });
  });  
});
