/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: backend/server.js
 * Description: Initializes the Express server and mounts the API routes.
 * Author: Jovian Niko Soesilo
 * Date Created: 2026-11-17
 * Last Modified: 2026-11-17
 * Modified by: Jovian Niko Soesilo
 * ============================================================================
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import restaurantRoutes from './src/routes/restaurants.js';
import geocodeRoutes from './src/routes/geocode.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/geocode', geocodeRoutes);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
