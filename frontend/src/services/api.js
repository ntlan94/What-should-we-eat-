/**
 * Project: What Should We Eat?
 * File: frontend/src/services/api.js
 * Description: Frontend API client for backend room operations.
 * Modified by: Thanh Lan Ngo
 */

const API_BASE_URL = (
  window.WSWE_API_BASE_URL || `http://${window.location.hostname || 'localhost'}:3000/api`
).replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Backend returned an unreadable response (${response.status})`);
  }
  if (!response.ok) {
    throw new Error(body.error || `Backend request failed (${response.status})`);
  }
  return body;
}

function decorateRoom(room) {
  const imageByCuisine = [
    { match: /pizza|italian/i, url: 'photo-1513104890138-7c749659a591' },
    { match: /thai|noodle|asian|sushi/i, url: 'photo-1559314809-0d155014e29e' },
    { match: /burger|american|fast.food/i, url: 'photo-1568901346375-23c9450c58cd' },
    { match: /taco|mexican/i, url: 'photo-1565299585323-38d6b0865b47' },
  ];
  const imageFor = (cuisine) => {
    const match = imageByCuisine.find(({ match: pattern }) => pattern.test(cuisine || ''));
    const imageId = match?.url || 'photo-1546069901-ba9599a7e63c';
    return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=800&q=80`;
  };
  const displayRestaurant = (restaurant) => {
    const cuisine = (restaurant.cuisine || 'restaurant').replace(/[_;]/g, ' ');
    const distance = Number.isFinite(restaurant.distance)
      ? restaurant.distance < 1000
        ? `${Math.round(restaurant.distance)} m away`
        : `${(restaurant.distance / 1000).toFixed(1)} km away`
      : '';
    const availability = restaurant.isOpenNow === true
      ? 'Open now'
      : restaurant.isOpenNow === false
        ? 'Closed'
        : '';
    return {
      ...restaurant,
      image: imageFor(cuisine),
      description: [cuisine, distance, availability].filter(Boolean).join(' • '),
    };
  };
  const restaurants = room.restaurants.map(displayRestaurant);
  return {
    ...room,
    restaurants,
    matchedRestaurant: room.matchedRestaurant
      ? displayRestaurant(room.matchedRestaurant)
      : null,
  };
}

export async function createRoom({ location, radiusKm, member }) {
  const room = await request('/rooms', {
    method: 'POST',
    body: JSON.stringify({ location, radiusKm, member }),
  });
  return decorateRoom(room);
}

export async function joinRoom(code, member) {
  const room = await request(`/rooms/${encodeURIComponent(code)}/join`, {
    method: 'POST',
    body: JSON.stringify({ member }),
  });
  return decorateRoom(room);
}

export async function fetchRoom(code) {
  return decorateRoom(await request(`/rooms/${encodeURIComponent(code)}`));
}

export async function submitSwipe(code, memberId, restaurantId, direction) {
  const room = await request(`/rooms/${encodeURIComponent(code)}/swipes`, {
    method: 'POST',
    body: JSON.stringify({ memberId, restaurantId, direction }),
  });
  return decorateRoom(room);
}
