import { showGlobalNotification } from './global-notification.js';
import { showFieldError, hideFieldError, validateEmail } from './form-validation.js';

export function initFooterSubscription() {
  const form = document.getElementById('subscribeForm');
  const emailInput = document.getElementById('subscribeEmail');
  const errorElement = document.getElementById('subscribeEmailError');

  if (!form || !emailInput || !errorElement) return;

    emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value) || emailInput.value.trim() === '') {
      hideFieldError(emailInput, errorElement);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      showFieldError(emailInput, errorElement, 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      showFieldError(emailInput, errorElement, 'Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    hideFieldError(emailInput, errorElement);

    try {
      const response = await fetch('https://your-energy.b.goit.study/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        showGlobalNotification(data.message, 'success');
        form.reset();
      } 
      else if (response.status === 409) {
        showGlobalNotification("You've already subscribed. No need to resubscribe.", 'warning');
        form.reset();
      } 
      else {
        throw new Error('Subscription failed');
      }

    } catch (error) {
      showGlobalNotification('Something went wrong. Please try again later.', 'error');
      console.error(error);
    }
  });
}