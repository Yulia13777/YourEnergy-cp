import { openExerciseModal } from './exercise-modal.js';
import { getFavorites } from './favorites.js';
import { showGlobalNotification } from './global-notification.js';

let currentFilter = 'Muscles';
let currentPage = 1;
let currentCategory = null;
let currentSearchKeyword = '';
let currentMode = 'home';

// Утиліти визначення ліміту карток
function getCategoriesLimit() {
  const width = window.innerWidth;

  if (width <= 767) return 9; // mobile
  return 12; // desktop
}

function getExercisesLimit() {
  const width = window.innerWidth;

  if (width <= 767) return 8; // mobile
  return 10; // desktop
}

// Утиліти для роботи із зображенням
function createOptimizedImage(originalUrl, alt, className = '') {
  if (!originalUrl) return '';

  const proxyBase = 'https://wsrv.nl/?url=';

  const sm = `${proxyBase}${originalUrl}&w=150&output=webp&q=75`;

  const md = `${proxyBase}${originalUrl}&w=350&output=webp&q=75`;

  const lg = `${proxyBase}${originalUrl}&w=700&output=webp&q=80`;

  return `
    <img 
      class="${className}" 
      src="${md}" 
      srcset="${sm} 150w, ${md} 350w, ${lg} 700w"
      sizes="(max-width: 767px) 150px, (max-width: 1440px) 350px, 350px"
      alt="${alt}" 
      loading="lazy" 
      decoding="async"
    />
  `;
}

// Керування полем пошуку
function showSearchField() {
  const searchField = document.getElementById('js-exercises-search');
  if (searchField) {
    searchField.style.display = 'flex';
  }
}

function hideSearchField() {
  const searchField = document.getElementById('js-exercises-search');
  const searchInput = document.getElementById('js-exercises-search-input');
  if (searchField) {
    searchField.style.display = 'none';
  }
  if (searchInput) {
    searchInput.value = '';
  }
  currentSearchKeyword = '';
}

// Обробник подій
export function initCardsEventListener() {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) return;

  cardsContainer.addEventListener('click', event => {
    const startBtn = event.target.closest(
      '.exercises__content__main__cards-item-start-btn'
    );

    if (startBtn) {
      const exerciseCard = startBtn.closest(
        '.exercises__content__main__cards-item--exercise'
      );

      if (!exerciseCard) return;

      const exerciseId = exerciseCard.dataset.exerciseId;
      if (!exerciseId) return;

      openExerciseModal(exerciseId);
      return;
    }

    const categoryCard = event.target.closest(
      '.exercises__content__main__cards-item'
    );

    if (!categoryCard) return;

    if (
      categoryCard.classList.contains(
        'exercises__content__main__cards-item--exercise'
      )
    ) {
      return;
    }

    const categoryName = categoryCard.dataset.categoryName;
    if (!categoryName) return;

    loadExercisesByCategory(categoryName);
  });
}

export function initHashtags() {
  const hashtagsContainer = document.querySelector('.home__hashtags');
  if (!hashtagsContainer) return;

  hashtagsContainer.addEventListener('click', event => {
    const targetBtn = event.target.closest('button');
    if (!targetBtn) return;

    const keyword =
      targetBtn.getAttribute('data-keyword') ||
      targetBtn.textContent.replace('#', '').trim();

    if (currentMode !== 'home') {
      const homeLink = document.querySelector(
        '.header__nav-link[data-page="home"]'
      );
      if (homeLink) {
        homeLink.click();
      } else {
        switchToHome();
      }
    }

    const searchInput = document.getElementById('js-exercises-search-input');

    if (searchInput) {
      searchInput.value = keyword;
    }

    const exercisesContent = document.querySelector('.exercises__content');
    if (exercisesContent) {
      exercisesContent.scrollIntoView({ behavior: 'smooth' });
    }

    if (currentCategory) {
      loadExercisesByCategory(currentCategory, 1, keyword);
    } else {
      showGlobalNotification(
        'Please select a category (e.g., abs) to start searching.',
        'error'
      );
    }
  });
}

// Створення карток
function createExerciseCard(exercise) {
  return `
    <div class="exercises__content__main__cards-item" data-category-name="${exercise.name}">
      <div class="exercises__content__main__cards-item-image">
        ${createOptimizedImage(exercise.imgURL, `${exercise.name} exercise`)}
        <div class="exercises__content__main__cards-item-overlay">
          <div class="exercises__content__main__cards-item-overlay-name">${exercise.name}</div>
          <div class="exercises__content__main__cards-item-overlay-category">${exercise.filter}</div>
        </div>
      </div>
    </div>
  `;
}

function createExerciseItemCard(exercise) {
  const rating = exercise.rating || 0;
  const burnedCalories = exercise.burnedCalories || 0;
  const time = exercise.time || 0;
  const bodyPart = exercise.bodyPart || '';
  const target = exercise.target || '';
  const exerciseId = exercise._id || '';

  return `
    <li class="exercises__content__main__cards-item exercises__content__main__cards-item--exercise" data-exercise-id="${exerciseId}">
      <div class="exercises__content__main__cards-item-header">
        <div class="exercises__content__main__cards-item-header-left">
          <button disabled class="exercises__content__main__cards-item-workout-btn">WORKOUT</button>
          <div class="exercises__content__main__cards-item-rating">
            <span class="exercises__content__main__cards-item-rating-value">${rating.toFixed(
              1
            )}</span>
            <svg class="exercises__content__main__cards-item-rating-star" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 0L11.0206 6.21885L17.5595 6.21885L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885L6.97937 6.21885L9 0Z" fill="#EEA10C"/>
            </svg>
          </div>
        </div>
        <button class="exercises__content__main__cards-item-start-btn">
          Start
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.75 4.5L11.25 9L6.75 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="exercises__content__main__cards-item-body">
        <div class="exercises__content__main__cards-item-icon">
          <svg width="34" height="32" viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="16" fill="rgba(36, 36, 36, 1)" fill-opacity="0.2"/>
            <path d="M24.7293 11.907C24.4611 11.594 23.9834 11.5528 23.6631 11.8138L21.5637 13.5369L20.5983 11.1998C20.564 11.1121 20.5119 11.0384 20.452 10.9734C20.2547 10.5446 19.9122 10.1763 19.44 9.96297C19.235 9.872 19.0233 9.82326 18.8116 9.79944C18.765 9.77561 18.7229 9.7442 18.6697 9.72796L14.9754 8.72184C14.7681 8.6666 14.5597 8.70234 14.3891 8.79981C14.1862 8.86696 14.0122 9.011 13.9291 9.22002L12.538 12.7149C12.3873 13.0951 12.5801 13.5239 12.9703 13.6734C13.3582 13.8207 13.7983 13.6311 13.9501 13.2499L15.125 10.2987L16.8076 10.7557C16.7666 10.8207 16.7222 10.8814 16.689 10.9507L14.532 15.5188C14.501 15.586 14.4844 15.6542 14.4622 15.7235L11.8408 20.0177L7.45378 21.4516C6.95721 21.8144 6.85192 22.4978 7.2188 22.983C7.5879 23.4692 8.28951 23.5721 8.78497 23.2137L13.274 21.7029C13.4114 21.6054 13.5112 21.4776 13.5866 21.34C13.6431 21.2816 13.7074 21.235 13.7506 21.1624L15.3135 18.6022L18.0878 20.9123L15.1195 24.1808C14.7105 24.6313 14.7515 25.3255 15.2148 25.7241C15.677 26.1259 16.3853 26.0836 16.7965 25.6309L20.5008 21.5534C20.6161 21.4278 20.6848 21.2826 20.7313 21.131C20.759 21.0487 20.759 20.9632 20.7657 20.8776C20.7657 20.8343 20.7823 20.7953 20.779 20.7552C20.769 20.4563 20.6449 20.1661 20.3944 19.9592L17.8417 17.8322C18.0257 17.661 18.182 17.4574 18.2951 17.2181L19.9488 13.7189L20.4786 15.0975C20.5008 15.2199 20.5429 15.3401 20.6316 15.4409C20.7114 15.534 20.8134 15.5957 20.922 15.6391C20.9331 15.6445 20.9464 15.6456 20.9597 15.6488C21.0284 15.6726 21.0982 15.6954 21.1703 15.6986C21.2556 15.7062 21.3421 15.6954 21.4296 15.6715C21.4318 15.6705 21.4329 15.6705 21.4329 15.6705C21.4562 15.665 21.4795 15.6694 21.5028 15.6596C21.6258 15.6141 21.72 15.5372 21.8009 15.4474L24.8136 12.9488C25.1339 12.6857 24.9987 12.22 24.7293 11.907Z" fill="#F4F4F4"/>
            <path d="M20.9191 10.1263C22.0853 10.1263 23.0306 9.20259 23.0306 8.06314C23.0306 6.9237 22.0853 6 20.9191 6C19.753 6 18.8076 6.9237 18.8076 8.06314C18.8076 9.20259 19.753 10.1263 20.9191 10.1263Z" fill="#F4F4F4"/>
          </svg>
        </div>
        <h3 class="exercises__content__main__cards-item-title">${
          exercise.name
        }</h3>
      </div>
      <div class="exercises__content__main__cards-item-footer">
        <div class="exercises__content__main__cards-item-info">
          <span class="exercises__content__main__cards-item-info-label">Burned calories:</span>
          <span class="exercises__content__main__cards-item-info-value">${burnedCalories}</span>
          <span class="exercises__content__main__cards-item-info-label">/ ${time} min</span>
        </div>
        <div class="exercises__content__main__cards-item-info">
          <span class="exercises__content__main__cards-item-info-label">Body part:</span>
          <span class="exercises__content__main__cards-item-info-value">${bodyPart}</span>
        </div>
        <div class="exercises__content__main__cards-item-info">
          <span class="exercises__content__main__cards-item-info-label">Target:</span>
          <span class="exercises__content__main__cards-item-info-value">${target}</span>
        </div>
      </div>
    </li>
  `;
}

// Рендеринг карток
function renderExerciseCards(exercises) {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.remove('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  exercises.forEach(exercise => {
    const cardHTML = createExerciseCard(exercise);
    cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

function renderExerciseItemCards(exercises) {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.add('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  exercises.forEach(exercise => {
    const cardHTML = createExerciseItemCard(exercise);
    cardsContainer.insertAdjacentHTML('beforeend', cardHTML);
  });
}

function renderEmptyState() {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.add('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  const emptyStateHTML = `
    <div class="exercises__content__main__empty-state">
      <p class="exercises__content__main__empty-state-text">
        Unfortunately, no results were found. You may want to consider other search options.
      </p>
    </div>
  `;

  cardsContainer.insertAdjacentHTML('beforeend', emptyStateHTML);
}

// Навігація
export function updateBreadcrumbs(categoryName = null) {
  const breadcrumbsContainer = document.getElementById(
    'js-exercises-breadcrumbs'
  );

  if (!breadcrumbsContainer) {
    return;
  }

  breadcrumbsContainer.innerHTML = '';

  if (currentMode === 'favorites') {
    const favoritesTitle = document.createElement('button');
    favoritesTitle.className =
      'exercises__content__header-breadcrumbs-item exercises__content__header-breadcrumbs-item--active';
    favoritesTitle.textContent = 'Favorites';
    favoritesTitle.setAttribute('data-breadcrumb', 'favorites');
    breadcrumbsContainer.appendChild(favoritesTitle);
    return;
  }

  const exercisesBtn = document.createElement('button');
  exercisesBtn.className = 'exercises__content__header-breadcrumbs-item';
  exercisesBtn.textContent = 'Exercises';
  exercisesBtn.setAttribute('data-breadcrumb', 'exercises');

  if (!categoryName) {
    exercisesBtn.classList.add(
      'exercises__content__header-breadcrumbs-item--active'
    );
  }

  exercisesBtn.addEventListener('click', () => {
    currentCategory = null;
    currentPage = 1;
    loadExerciseCards(currentFilter, currentPage);
  });

  breadcrumbsContainer.appendChild(exercisesBtn);

  if (categoryName) {
    const separator = document.createElement('span');
    separator.className = 'exercises__content__header-breadcrumbs-separator';
    separator.textContent = '/';
    breadcrumbsContainer.appendChild(separator);

    const categoryBtn = document.createElement('button');
    categoryBtn.className =
      'exercises__content__header-breadcrumbs-item exercises__content__header-breadcrumbs-item--active';
    categoryBtn.textContent = categoryName;
    breadcrumbsContainer.appendChild(categoryBtn);
  }
}

// Пагінація
function renderPagination(totalPages, page = 1) {
  const paginationContainer = document.querySelector(
    '.exercises__content__pagination'
  );

  if (!paginationContainer) {
    return;
  }

  paginationContainer.innerHTML = '';

  if (totalPages <= 1) {
    return;
  }

  const goToPage = pageNumber => {
    currentPage = pageNumber;
    if (currentMode === 'favorites') {
      loadFavoritesExercises(pageNumber);
    } else if (currentCategory) {
      loadExercisesByCategory(
        currentCategory,
        pageNumber,
        currentSearchKeyword
      );
    } else {
      loadExerciseCards(currentFilter, pageNumber);
    }
  };

  const createArrow = (html, isDisabled, onClick) => {
    const btn = document.createElement('button');
    btn.className = 'exercises__content__pagination-arrow';
    btn.innerHTML = html;
    btn.disabled = isDisabled;
    btn.addEventListener('click', onClick);
    return btn;
  };

  const createPageBtn = num => {
    const btn = document.createElement('button');
    btn.className = 'exercises__content__pagination-page';
    btn.textContent = num;
    if (num === page)
      btn.classList.add('exercises__content__pagination-page--active');
    btn.addEventListener('click', () => goToPage(num));
    return btn;
  };

  const createEllipsis = () => {
    const span = document.createElement('span');
    span.className = 'exercises__content__pagination-ellipsis';
    span.textContent = '...';
    return span;
  };

  paginationContainer.appendChild(
    createArrow('&laquo;', page === 1, () => goToPage(1))
  );
  paginationContainer.appendChild(
    createArrow('&lsaquo;', page === 1, () => goToPage(page - 1))
  );

  const pages = [];
  pages.push(1);

  if (totalPages <= 7) {
    for (let i = 2; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    let leftBound = page - 1;
    let rightBound = page + 1;

    if (page < 5) {
      leftBound = 2;
      rightBound = 5;
    }

    if (page > totalPages - 4) {
      leftBound = totalPages - 4;
      rightBound = totalPages - 1;
    }

    if (leftBound > 2) {
      pages.push('...');
    }

    for (let i = leftBound; i <= rightBound; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (rightBound < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  pages.forEach(item => {
    if (item === '...') {
      paginationContainer.appendChild(createEllipsis());
    } else {
      paginationContainer.appendChild(createPageBtn(item));
    }
  });

  paginationContainer.appendChild(
    createArrow('&rsaquo;', page === totalPages, () => goToPage(page + 1))
  );
  paginationContainer.appendChild(
    createArrow('&raquo;', page === totalPages, () => goToPage(totalPages))
  );
}

// Завантаження даних
export function loadExerciseCards(filter, page = 1) {
  currentFilter = filter;
  currentPage = page;

  hideSearchField();
  const encodedFilter = encodeURIComponent(filter);
  const limit = getCategoriesLimit();
  const url = `https://your-energy.b.goit.study/api/filters?filter=${encodedFilter}&page=${page}&limit=${limit}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const exercises = data.results || data.exercises || data || [];

      const totalPages =
        data.totalPages || data.total_pages || data.pageCount || 1;

      if (Array.isArray(exercises) && exercises.length > 0) {
        currentCategory = null;
        updateBreadcrumbs(null);
        renderExerciseCards(exercises);
        renderPagination(totalPages, page);
      } else {
        updateBreadcrumbs(null);
        renderPagination(1, 1);
      }
    });
}

export function loadExercisesByCategory(
  categoryName,
  page = 1,
  keyword = currentSearchKeyword
) {
  currentCategory = categoryName;
  currentPage = page;
  currentSearchKeyword = keyword;

  showSearchField();
  const limit = getExercisesLimit();

  let paramName = '';
  if (currentFilter === 'Muscles') {
    paramName = 'muscles';
  } else if (currentFilter === 'Body parts') {
    paramName = 'bodypart';
  } else if (currentFilter === 'Equipment') {
    paramName = 'equipment';
  }

  const encodedCategory = encodeURIComponent(categoryName);
  let url = `https://your-energy.b.goit.study/api/exercises?${paramName}=${encodedCategory}&page=${page}&limit=${limit}`;

  if (keyword && keyword.trim() !== '') {
    const encodedKeyword = encodeURIComponent(keyword.trim());
    url += `&keyword=${encodedKeyword}`;
  }

  fetch(url)
    .then(response => {
      if (response.status === 409) return { results: [], totalPages: 0 };
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    })
    .then(data => {
      const exercises = data.results || [];

      const totalPages = data.totalPages || 1;

      updateBreadcrumbs(categoryName);

      if (Array.isArray(exercises) && exercises.length > 0) {
        renderExerciseItemCards(exercises);
        renderPagination(totalPages, page);
      } else {
        renderEmptyState();
        const paginationContainer = document.querySelector(
          '.exercises__content__pagination'
        );
        if (paginationContainer) {
          paginationContainer.innerHTML = '';
        }
      }
    });
}

export function initSearch() {
  const searchContainer = document.getElementById('js-exercises-search');
  const searchInput = document.getElementById('js-exercises-search-input');

  if (!searchContainer || !searchInput) return;

  const handleSearchSubmit = () => {
    const keyword = searchInput.value.trim().toLowerCase();

    if (currentCategory) {
      loadExercisesByCategory(currentCategory, 1, keyword);
    } else {
      showGlobalNotification('Please select a category first', 'error');
    }
  };

  searchInput.addEventListener('input', event => {
    const text = event.target.value.trim();

    if (text === '' && currentCategory) {
      loadExercisesByCategory(currentCategory, 1, '');
    }
  });

  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }
  });

  const searchIcon = searchContainer.querySelector(
    '.exercises__content__header-search-icon'
  );
  if (searchIcon) {
    searchIcon.addEventListener('click', handleSearchSubmit);
  }
}

function renderFavoritesEmptyState() {
  const cardsContainer = document.querySelector(
    '.exercises__content__main__cards'
  );

  if (!cardsContainer) {
    return;
  }

  cardsContainer.classList.add('exercises__content__main__cards--exercises');

  cardsContainer.innerHTML = '';

  const emptyStateHTML = `
    <div class="exercises__content__main__empty-state">
      <p class="exercises__content__main__empty-state-text">
        It appears that you haven't added any exercises to your favorites yet. 
        To get started, you can add exercises that you like to your favorites 
        for easier access in the future.
      </p>
    </div>
  `;

  cardsContainer.insertAdjacentHTML('beforeend', emptyStateHTML);
}

export function loadFavoritesExercises(page = 1) {
  currentPage = page;

  const favoriteIds = getFavorites();
  const limit = getExercisesLimit();

  updateBreadcrumbs(null);

  if (favoriteIds.length === 0) {
    renderFavoritesEmptyState();
    const paginationContainer = document.querySelector(
      '.exercises__content__pagination'
    );
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(favoriteIds.length / limit);

  if (page > totalPages) {
    page = totalPages;
    currentPage = page;
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const idsToLoad = favoriteIds.slice(startIndex, endIndex);

  const promises = idsToLoad.map(id =>
    fetch(`https://your-energy.b.goit.study/api/exercises/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch exercise');
        }
        return response.json();
      })
      .catch(error => {
        return null;
      })
  );

  Promise.all(promises).then(exercises => {
    const validExercises = exercises.filter(ex => ex !== null);

    if (validExercises.length > 0) {
      renderExerciseItemCards(validExercises);
      renderPagination(totalPages, page);
    } else {
      renderFavoritesEmptyState();
    }
  });
}

// Перемикання режимів
export function switchToHome() {
  currentMode = 'home';
  currentCategory = null;
  currentSearchKeyword = '';

  // Показуємо фільтри
  const filtersContainer = document.querySelector(
    '.exercises__content__header-filters'
  );
  if (filtersContainer) {
    filtersContainer.style.display = 'flex';
  }

  // Видаляємо клас favorites з контейнера
  const contentContainer = document.querySelector('.exercises__content');
  if (contentContainer) {
    contentContainer.classList.remove('exercises__content--favorites');
  }

  // Завантажуємо стандартні картки
  loadExerciseCards(currentFilter, 1);
}

export function switchToFavorites() {
  currentMode = 'favorites';
  currentCategory = null;
  currentSearchKeyword = '';

  const filtersContainer = document.querySelector(
    '.exercises__content__header-filters'
  );
  if (filtersContainer) {
    filtersContainer.style.display = 'none';
  }

  hideSearchField();

  const contentContainer = document.querySelector('.exercises__content');
  if (contentContainer) {
    contentContainer.classList.add('exercises__content--favorites');
  }

  loadFavoritesExercises();
}

// Adaptive re-render on resize
let resizeTimeout;

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    currentPage = 1;

    if (currentMode === 'favorites') {
      loadFavoritesExercises(1);
    } else if (currentCategory) {
      loadExercisesByCategory(currentCategory, 1, currentSearchKeyword);
    } else {
      loadExerciseCards(currentFilter, 1);
    }
  }, 200);
});
