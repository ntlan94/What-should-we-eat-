/**
 * Project: What Should We Eat?
 * File: backend/src/services/database.js
 * Description: In-memory storage for rooms, members, and swipes.
 *              If nobody fully matches, picks the most-liked place.
 * Modified by: Jovian Niko Soesilo
 */

const rooms = new Map();

function toPublicRoom(room) {
  const votes = Object.fromEntries(room.restaurants.map(({ id }) => [id, 0]));
  for (const memberSwipes of Object.values(room.swipes)) {
    for (const [restaurantId, direction] of Object.entries(memberSwipes)) {
      if (direction === 'right' && Object.hasOwn(votes, restaurantId)) {
        votes[restaurantId] += 1;
      }
    }
  }

  const matchedRestaurant = room.restaurants.find((restaurant) =>
    room.members.length > 1 && votes[restaurant.id] === room.members.length
  ) ?? null;

  const finished = !matchedRestaurant && everyoneFinished(room);

  return {
    code: room.code,
    location: room.location,
    radiusKm: room.radiusKm,
    restaurants: room.restaurants,
    members: room.members,
    votes,
    // 'matched'  = everyone swiped right on the same place
    // 'finished' = everyone swiped every card with no full match -> see bestRestaurant
    status: matchedRestaurant ? 'matched' : finished ? 'finished' : 'swiping',
    matchedRestaurant,
    bestRestaurant: finished ? mostLiked(room.restaurants, votes) : null,
  };
}

// True when 2+ people are in the room and each has swiped on every restaurant.
function everyoneFinished(room) {
  return room.members.length > 1 && room.members.every((member) =>
    room.restaurants.every((restaurant) => room.swipes[member.id]?.[restaurant.id])
  );
}

// The restaurant with the most right swipes, or null if nobody liked anything.
// Ties go to the earlier card, which is the closer place (the deck is sorted by distance).
function mostLiked(restaurants, votes) {
  let best = null;
  for (const restaurant of restaurants) {
    if (votes[restaurant.id] > (best ? votes[best.id] : 0)) best = restaurant;
  }
  return best;
}

export function createRoom({ location, radiusKm, restaurants, host }) {
  let code;
  do {
    code = Math.random().toString(36).slice(2, 6).padEnd(4, '0').toUpperCase();
  } while (rooms.has(code));

  const room = {
    code,
    location,
    radiusKm,
    restaurants,
    members: [{ ...host, isHost: true }],
    swipes: {},
  };
  rooms.set(code, room);
  return toPublicRoom(room);
}

export function getRoom(code) {
  const room = rooms.get(code);
  return room ? toPublicRoom(room) : null;
}

export function joinRoom(code, member) {
  const room = rooms.get(code);
  if (!room) return { error: 'not_found' };
  if (toPublicRoom(room).status === 'matched') return { error: 'matched' };

  if (!room.members.some((existing) => existing.id === member.id)) {
    room.members.push({ ...member, isHost: false });
  }
  return { room: toPublicRoom(room) };
}

export function recordSwipe(code, memberId, restaurantId, direction) {
  const room = rooms.get(code);
  if (!room) return { error: 'not_found' };
  if (!room.members.some((member) => member.id === memberId)) {
    return { error: 'not_a_member' };
  }
  if (!room.restaurants.some((restaurant) => restaurant.id === restaurantId)) {
    return { error: 'restaurant_not_found' };
  }
  if (toPublicRoom(room).status === 'matched') return { error: 'matched' };

  room.swipes[memberId] ??= {};
  room.swipes[memberId][restaurantId] = direction;
  return { room: toPublicRoom(room) };
}