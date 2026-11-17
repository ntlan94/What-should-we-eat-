/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: backend/src/services/places.js
 * Description: Fetches nearby restaurants from the Geoapify Places API.
 *              Free plan: 3,000 credits/day, no credit card, so it can never bill us.
 * Author: Jovian Niko Soesilo
 * Date Created: 2026-11-17
 * Last Modified: 2026-11-17
 * Modified by: Jovian Niko Soesilo
 * ============================================================================
 */

import Restaurant from '../models/Restaurant.js';

const CATEGORIES = 'catering.restaurant,catering.fast_food,catering.cafe';

export async function getNearbyRestaurants({ lat, lng, radius = 2000, limit = 20 }) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) throw new Error('GEOAPIFY_API_KEY is missing from backend/.env');

  const params = new URLSearchParams({
    categories: CATEGORIES,
    filter: `circle:${lng},${lat},${radius}`, // Geoapify uses lng,lat order
    bias: `proximity:${lng},${lat}`,          // closest first
    limit: String(limit),
    apiKey,
  });

  const response = await fetch(`https://api.geoapify.com/v2/places?${params}`);
  if (!response.ok) {
    throw new Error(`Geoapify error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data.features
    .map((feature) => Restaurant.fromGeoapify(feature))
    .filter((restaurant) => restaurant.name); // skip places with no name
}
