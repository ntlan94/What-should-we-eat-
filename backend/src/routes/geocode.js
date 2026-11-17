/**
 * GET /api/geocode?text=Camden
 * Returns { lat, lng, label } for the best match.
 */
import { Router } from 'express';
import { geocode } from '../services/geocode.js';

const router = Router();

router.get('/', async (req, res) => {
  const text = String(req.query.text ?? '').trim();
  if (!text) {
    return res.status(400).json({ error: 'text query parameter is required' });
  }

  try {
    const place = await geocode(text);
    if (!place) {
      return res.status(404).json({ error: `No location found for "${text}"` });
    }
    res.json(place);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not look up that location' });
  }
});

export default router;
