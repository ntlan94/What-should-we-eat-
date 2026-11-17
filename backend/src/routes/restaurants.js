/**
 * GET /api/restaurants?lat=..&lng=..&radius=..
 * Returns nearby restaurants in the standard Restaurant format.
 */
import { Router } from 'express';
import { getNearbyRestaurants } from '../services/places.js';

const router = Router();

router.get('/', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius) || 2000; // metres

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng query parameters are required' });
  }

  try {
    const restaurants = await getNearbyRestaurants({ lat, lng, radius });
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not fetch restaurants' });
  }
});

export default router;
