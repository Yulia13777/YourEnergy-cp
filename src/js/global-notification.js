let notificationTimeout = null;

/**
 * Shows a global notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success' or 'error')
 */
export function showGlobalNotification(message, type = 'success') {
  const notification = document.getElementById('js-global-notification');
  const textElement = document.getElementById('js-global-notification-text');

  if (!notification || !textElement) return;

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }

  textElement.textContent = message;
  notification.classList.remove('global-notification--error');
  if (type === 'error') {
    notification.classList.add('global-notification--error');
  } else if (type === 'warning') {
    notification.classList.add('global-notification--warning');
  }

  notification.classList.add('global-notification--visible');

  notificationTimeout = setTimeout(() => {
    hideGlobalNotification();
  }, 3000);
}

export function hideGlobalNotification() {
  const notification = document.getElementById('js-global-notification');
  const textElement = document.getElementById('js-global-notification-text');

  if (!notification) return;

  if (notificationTimeout) {
    clearTimeout(notificationTimeout);
    notificationTimeout = null;
  }

  notification.classList.remove('global-notification--visible');

  setTimeout(() => {
    if (textElement) {
      textElement.textContent = '';
    }
    notification.classList.remove('global-notification--error', 'global-notification--warning');
  }, 300);
}

export function initGlobalNotification() {
  const closeBtn = document.getElementById('js-global-notification-close');

  if (closeBtn) {
    closeBtn.addEventListener('click', hideGlobalNotification);
  }
}
