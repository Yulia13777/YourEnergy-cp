// Утиліти для роботи для датою
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Завантаження цитати
async function loadQuoteOfTheDay() {
  const cachedQuoteText = localStorage.getItem('quote-text');
  const cachedQuoteAuthor = localStorage.getItem('quote-author');
  const cachedQuoteDate = localStorage.getItem('quote-date');
  const todayDate = getTodayDate();

  if (cachedQuoteText && cachedQuoteAuthor && cachedQuoteDate) {
    if (cachedQuoteDate === todayDate) {
      return { quote: cachedQuoteText, author: cachedQuoteAuthor };
    }
  }

  // Завантаження нової цитати з API
  try {
    const response = await fetch('https://your-energy.b.goit.study/api/quote');
    const data = await response.json();

    localStorage.setItem('quote-text', data.quote);
    localStorage.setItem('quote-author', data.author);
    localStorage.setItem('quote-date', todayDate);

    return { quote: data.quote, author: data.author };
  } catch (error) {
    if (cachedQuoteText && cachedQuoteAuthor) {
      return { quote: cachedQuoteText, author: cachedQuoteAuthor };
    }

    return null;
  }
}

// Відображення цитати
export async function displayQuote() {
  const quoteData = await loadQuoteOfTheDay();

  if (!quoteData) {
    return;
  }

  const quoteTextElement = document.getElementById('js-exercises-quote-text');
  const quoteAuthorElement = document.getElementById(
    'js-exercises-quote-author'
  );

  if (quoteTextElement) {
    quoteTextElement.textContent = quoteData.quote;
  }

  if (quoteAuthorElement) {
    quoteAuthorElement.textContent = quoteData.author;
  }
}
