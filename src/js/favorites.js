const FAVORITES_KEY = 'favorites';

// Отримання даних
export function getFavorites() {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    return [];
  }
}

// Додавання та видалення
export function addToFavorites(exerciseId) {
  try {
    const favorites = getFavorites();
    if (!favorites.includes(exerciseId)) {
      favorites.push(exerciseId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

export function removeFromFavorites(exerciseId) {
  try {
    const favorites = getFavorites();
    const filteredFavorites = favorites.filter(id => id !== exerciseId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredFavorites));
    return true;
  } catch (error) {
    return false;
  }
}

export function isFavorite(exerciseId) {
  const favorites = getFavorites();
  return favorites.includes(exerciseId);
}

// Перемикання стану
export function toggleFavorite(exerciseId) {
  if (isFavorite(exerciseId)) {
    removeFromFavorites(exerciseId);
    return false;
  } else {
    addToFavorites(exerciseId);
    return true;
  }
}
