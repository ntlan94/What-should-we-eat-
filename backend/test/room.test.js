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
