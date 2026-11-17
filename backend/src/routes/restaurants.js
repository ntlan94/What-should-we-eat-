/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: backend/src/routes/restaurants.js
 * Description: GET /api/restaurants?lat=..&lng=..&radius=..&openNow=true
 *              Returns nearby restaurants in the standard Restaurant format.
 * Author: Jovian Niko Soesilo
 * Colaborators: Thanh Lan Ngo
 * Date Created: 2026-11-17
 * Last Modified: 2026-11-17
 * Modified by: Jovian Niko Soesilo
 * ============================================================================
 */

import { Router } from 'express';
import { getNearbyRestaurants } from '../services/places.js';

const router = Router();

router.get('/', async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radius = Number(req.query.radius) || 2000; // metres
  const openNowOnly = req.query.openNow === 'true';

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: 'lat and lng query parameters are required' });
  }

  try {
    let restaurants = await getNearbyRestaurants({ lat, lng, radius });
    if (openNowOnly) {
      // Hide places known to be closed; keep ones with unknown hours.
      restaurants = restaurants.filter((r) => r.isOpenNow !== false);
    }
    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not fetch restaurants' });
  }
});

export default router;
