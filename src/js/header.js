import { switchToHome, switchToFavorites } from './exercises.js';

let currentPage = 'home';

let mobileMenu = null;
let burgerButton = null;
let closeButton = null;
let overlay = null;

// Перемикання сторінок
export function switchPage(page) {
  if (currentPage === page) return;

  currentPage = page;

  // Оновлення активного стану для десктопної навігації
  const navLinks = document.querySelectorAll('.header__nav-link');
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === page) {
      link.classList.add('header__nav-link--active');
    } else {
      link.classList.remove('header__nav-link--active');
    }
  });

  // Оновлення для активного стану для мобільної навігації
  const mobileNavLinks = document.querySelectorAll('.mobile-menu__nav-link');
  mobileNavLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === page) {
      link.classList.add('mobile-menu__nav-link--active');
    } else {
      link.classList.remove('mobile-menu__nav-link--active');
    }
  });

  // Завантаження контенту відповідної сторінки
  if (page === 'home') {
    switchToHome();
  } else if (page === 'favorites') {
    switchToFavorites();
  }
}

// Мобільне меню
function openMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.add('is-open');
    burgerButton.classList.add('is-hidden');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  if (mobileMenu) {
    mobileMenu.classList.remove('is-open');
    burgerButton.classList.remove('is-hidden');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Ініціалізація
export function initHeader() {
  const navLinks = document.querySelectorAll('.header__nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) {
        switchPage(page);
      }
    });
  });

  mobileMenu = document.querySelector('.mobile-menu');
  burgerButton = document.querySelector('.header__burger');
  closeButton = document.querySelector('.mobile-menu__close');
  overlay = document.getElementById('overlay');

  // Відкриття мобільного меню
  if (burgerButton) {
    burgerButton.addEventListener('click', openMobileMenu);
  }

  // Закриття мобільного меню
  if (closeButton) {
    closeButton.addEventListener('click', closeMobileMenu);
  }

  // Ініціалізація мобільної навігації
  const mobileNavLinks = document.querySelectorAll('.mobile-menu__nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      if (page) {
        switchPage(page);
        closeMobileMenu();
      }
    });
  });

  // Закриття меню при кліку на overlay
  if (mobileMenu) {
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) {
        closeMobileMenu();
      }
    });
  }
}

export function getCurrentPage() {
  return currentPage;
}
