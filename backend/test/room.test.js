/**
 * Project: What Should We Eat?
 * File: backend/test/room.test.js
 * Description: Tests shared room membership and swipe behavior.
 * Modified by: Thanh Lan Ngo
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoom, getRoom, joinRoom, recordSwipe } from '../src/services/database.js';

test('room membership and swipes are shared and a match needs every member', () => {
  const restaurant = { id: `test-${crypto.randomUUID()}`, name: 'Test Restaurant' };
  const room = createRoom({
    location: 'Test location',
    radiusKm: 3,
    restaurants: [restaurant],
    host: { id: crypto.randomUUID(), name: 'Host' },
  });
  const guest = { id: crypto.randomUUID(), name: 'Guest' };

  assert.equal(room.members.length, 1);
  assert.equal(joinRoom(room.code, guest).room.members.length, 2);

  const hostSwipe = recordSwipe(room.code, room.members[0].id, restaurant.id, 'right');
  assert.equal(hostSwipe.room.votes[restaurant.id], 1);
  assert.equal(hostSwipe.room.matchedRestaurant, null);

  const guestSwipe = recordSwipe(room.code, guest.id, restaurant.id, 'right');
  assert.equal(guestSwipe.room.votes[restaurant.id], 2);
  assert.equal(guestSwipe.room.matchedRestaurant.id, restaurant.id);
  assert.equal(getRoom(room.code).status, 'matched');
});

test('a solo host cannot match before other people join', () => {
  const restaurant = { id: `test-${crypto.randomUUID()}`, name: 'Test Restaurant' };
  const room = createRoom({
    location: 'Test location',
    radiusKm: 3,
    restaurants: [restaurant],
    host: { id: crypto.randomUUID(), name: 'Host' },
  });

  const result = recordSwipe(room.code, room.members[0].id, restaurant.id, 'right');
  assert.equal(result.room.votes[restaurant.id], 1);
  assert.equal(result.room.matchedRestaurant, null);
});

// Helper: a room with a host, one guest, and the given restaurant ids.
function roomWithGuest(ids) {
  const room = createRoom({
    location: 'Test location',
    radiusKm: 3,
    restaurants: ids.map((id) => ({ id, name: `Restaurant ${id}` })),
    host: { id: crypto.randomUUID(), name: 'Host' },
  });
  const guest = { id: crypto.randomUUID(), name: 'Guest' };
  joinRoom(room.code, guest);
  return { code: room.code, hostId: room.members[0].id, guestId: guest.id };
}

test('no best place is picked until everyone has swiped every card', () => {
  const { code, hostId, guestId } = roomWithGuest(['a', 'b']);

  recordSwipe(code, hostId, 'a', 'right');
  recordSwipe(code, hostId, 'b', 'left');
  recordSwipe(code, guestId, 'a', 'left');

  assert.equal(getRoom(code).status, 'swiping'); // guest has not swiped b yet
  assert.equal(getRoom(code).bestRestaurant, null);
});

test('finished room picks the most votes, and ties go to the closer place', () => {
  const { code, hostId, guestId } = roomWithGuest(['near', 'far', 'nope']);

  recordSwipe(code, hostId, 'near', 'right');
  recordSwipe(code, hostId, 'far', 'left');
  recordSwipe(code, hostId, 'nope', 'left');
  recordSwipe(code, guestId, 'near', 'left');
  recordSwipe(code, guestId, 'far', 'right');
  const result = recordSwipe(code, guestId, 'nope', 'left');

  assert.equal(result.room.status, 'finished');
  assert.equal(result.room.matchedRestaurant, null);
  assert.equal(result.room.bestRestaurant.id, 'near'); // 1 vote each, 'near' comes first
});

test('finished room has no best place when nobody liked anything', () => {
  const { code, hostId, guestId } = roomWithGuest(['a', 'b']);

  for (const id of ['a', 'b']) {
    recordSwipe(code, hostId, id, 'left');
    recordSwipe(code, guestId, id, 'left');
  }

  assert.equal(getRoom(code).status, 'finished');
  assert.equal(getRoom(code).bestRestaurant, null);
});

test('a late joiner puts a finished room back into swiping', () => {
  const { code, hostId, guestId } = roomWithGuest(['a']);
  recordSwipe(code, hostId, 'a', 'left');
  recordSwipe(code, guestId, 'a', 'left');
  assert.equal(getRoom(code).status, 'finished');

  joinRoom(code, { id: crypto.randomUUID(), name: 'Late' });
  assert.equal(getRoom(code).status, 'swiping');
});

test('room swipes reject non-members and unknown restaurants', () => {
  const room = createRoom({
    location: 'Test location',
    radiusKm: 3,
    restaurants: [{ id: `test-${crypto.randomUUID()}`, name: 'Test Restaurant' }],
    host: { id: crypto.randomUUID(), name: 'Host' },
  });

  assert.deepEqual(
    recordSwipe(room.code, 'not-a-member', room.restaurants[0].id, 'right'),
    { error: 'not_a_member' },
  );
  assert.deepEqual(
    recordSwipe(room.code, room.members[0].id, 'unknown', 'right'),
    { error: 'restaurant_not_found' },
  );
});
