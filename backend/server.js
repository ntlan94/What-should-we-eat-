/**
 * Initializes the Express server and mounts the API routes.
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import restaurantRoutes from './src/routes/restaurants.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/restaurants', restaurantRoutes);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
