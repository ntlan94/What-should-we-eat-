/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: backend/src/services/geocode.js
 * Description: Turns a typed place name (e.g. "Camden") into coordinates
 *              using the Geoapify Geocoding API. Same free key as places.js.
 * Author: Jovian Niko Soesilo
 * Date Created: 2026-11-17
 * Last Modified: 2026-11-17
 * Modified by: Jovian Niko Soesilo
 * ============================================================================
 */

export async function geocode(text) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) throw new Error('GEOAPIFY_API_KEY is missing from backend/.env');

  const params = new URLSearchParams({
    text,
    limit: '1',
    format: 'json',
    apiKey,
  });

  const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${params}`);
  if (!response.ok) {
    throw new Error(`Geoapify error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const best = data.results?.[0];
  if (!best) return null; // nothing found for that text

  return {
    lat: best.lat,
    lng: best.lon,
    label: best.formatted,
  };
}
