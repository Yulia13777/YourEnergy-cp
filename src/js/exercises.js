import { openExerciseModal } from './exercise-modal.js';
import { getFavorites } from './favorites.js';
import { showGlobalNotification } from './global-notification.js';

let currentFilter = 'Muscles';
let currentPage = 1;
let currentCategory = null;
let currentSearchKeyword = '';
let currentMode = 'home';
const ITEMS_PER_PAGE = 10;

// Утиліти визначення ліміту карток
function getItemsPerPage() {
  const width = window.innerWidth;

  if (width <= 768) return 9; // tablet
  return 12; // desktop
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

  if (!cardsContainer) {
    return;
  }

  cardsContainer.addEventListener('click', event => {
    const card = event.target.closest('.exercises__content__main__cards-item');

    if (!card) {
      return;
    }

    const categoryName = card.getAttribute('data-category-name');
    if (categoryName) {
      loadExercisesByCategory(categoryName);
      return;
    }

    const exerciseId = card.getAttribute('data-exercise-id');
    if (exerciseId) {
      openExerciseModal(exerciseId);
      return;
    }
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
    <div class="exercises__content__main__cards-item exercises__content__main__cards-item--exercise" data-exercise-id="${exerciseId}">
      <div class="exercises__content__main__cards-item-header">
        <div class="exercises__content__main__cards-item-header-left">
          <button class="exercises__content__main__cards-item-workout-btn">WORKOUT</button>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
    </div>
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
  const url = `https://your-energy.b.goit.study/api/filters?filter=${encodedFilter}&page=${page}`;

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

  let paramName = '';
  if (currentFilter === 'Muscles') {
    paramName = 'muscles';
  } else if (currentFilter === 'Body parts') {
    paramName = 'bodypart';
  } else if (currentFilter === 'Equipment') {
    paramName = 'equipment';
  }

  const encodedCategory = encodeURIComponent(categoryName);
  let url = `https://your-energy.b.goit.study/api/exercises?${paramName}=${encodedCategory}&page=${page}&limit=10`;

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

  updateBreadcrumbs(null);

  if (favoriteIds.length === 0) {
    renderFavoritesEmptyState();
    const paginationContainer = document.querySelector(
      '.exercises__content__pagination'
    );
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(favoriteIds.length / ITEMS_PER_PAGE);

  if (page > totalPages) {
    page = totalPages;
    currentPage = page;
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
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
