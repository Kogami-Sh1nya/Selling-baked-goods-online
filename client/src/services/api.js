const API_URL = 'https://localhost:5000/api';

export async function api(path, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(API_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Ошибка запроса');
  }

  return data;
}

export function getImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;

  return `https://localhost:5000${imageUrl}`;
}