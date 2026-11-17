/**
 * Project: What Should We Eat?
 * File: backend/src/controllers/roomController.js
 * Description: Handles room creation, joining, state, and swipe requests.
 * Modified by: Thanh Lan Ngo
 */

import { createRoom, getRoom, joinRoom, recordSwipe } from '../services/database.js';
import { geocode } from '../services/geocode.js';
import { getNearbyRestaurants } from '../services/places.js';

const isValidMember = (member) =>
  member
  && typeof member.id === 'string'
  && member.id.length > 0
  && member.id.length <= 128
  && (member.name === undefined || (typeof member.name === 'string' && member.name.length <= 60));

export async function createRoomHandler(req, res) {
  const { location, radiusKm, member } = req.body ?? {};
  if (typeof location !== 'string' || !location.trim()) {
    return res.status(400).json({ error: 'location is required' });
  }
  if (!Number.isFinite(radiusKm) || radiusKm < 1 || radiusKm > 15) {
    return res.status(400).json({ error: 'radiusKm must be between 1 and 15' });
  }
  if (!isValidMember(member)) {
    return res.status(400).json({ error: 'A valid member id is required' });
  }

  try {
    const place = await geocode(location.trim());
    if (!place) return res.status(404).json({ error: 'No location found' });
    const restaurants = await getNearbyRestaurants({
      lat: place.lat,
      lng: place.lng,
      radius: Math.round(radiusKm * 1000),
    });
    const room = createRoom({
      location: place.label,
      radiusKm,
      restaurants,
      host: { id: member.id, name: member.name || 'Host' },
    });
    return res.status(201).json(room);
  } catch (error) {
    console.error('Room creation failed:', error);
    return res.status(502).json({ error: 'Could not find restaurants for that location' });
  }
}

export function getRoomHandler(req, res) {
  const room = getRoom(req.params.code.toUpperCase());
  if (!room) return res.status(404).json({ error: 'Room not found' });
  return res.json(room);
}

export function joinRoomHandler(req, res) {
  const { member } = req.body ?? {};
  if (!isValidMember(member)) {
    return res.status(400).json({ error: 'A valid member id is required' });
  }

  const result = joinRoom(req.params.code.toUpperCase(), {
    id: member.id,
    name: typeof member.name === 'string' && member.name.trim() ? member.name.trim() : 'Guest',
  });
  if (result.error === 'not_found') return res.status(404).json({ error: 'Room not found' });
  if (result.error === 'matched') return res.status(409).json({ error: 'This room already has a match' });
  return res.json(result.room);
}

export function swipeHandler(req, res) {
  const { memberId, restaurantId, direction } = req.body ?? {};
  if (typeof memberId !== 'string' || !memberId || typeof restaurantId !== 'string' || !restaurantId) {
    return res.status(400).json({ error: 'memberId and restaurantId are required' });
  }
  if (direction !== 'left' && direction !== 'right') {
    return res.status(400).json({ error: 'direction must be left or right' });
  }

  const result = recordSwipe(
    req.params.code.toUpperCase(),
    memberId,
    restaurantId,
    direction
  );
  if (result.error === 'not_found') return res.status(404).json({ error: 'Room not found' });
  if (result.error === 'not_a_member') return res.status(403).json({ error: 'Join this room before swiping' });
  if (result.error === 'restaurant_not_found') {
    return res.status(404).json({ error: 'Restaurant not found in this room' });
  }
  if (result.error === 'matched') return res.status(409).json({ error: 'This room already has a match' });
  return res.json(result.room);
}