/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: backend/src/services/staticMap.js
 * Description: Fetches a small map image with a pin from the Geoapify Static
 *              Maps API. Images are cached in memory so each location is only
 *              downloaded once, which saves free daily credits.
 * Author: Jovian Niko Soesilo
 * Collaborators: Thanh Lan Ngo
 * Date Created: 2026-11-21
 * Last Modified: 2026-11-21
 * Modified by: Jovian Niko Soesilo
 * ============================================================================
 */

const WIDTH = 600;
const HEIGHT = 400;
const ZOOM = 16;
const PIN_COLOR = '#f97316'; // orange, matches the app theme
const MAX_CACHED_IMAGES = 300;

const cache = new Map(); // "lat,lng" -> JPEG Buffer

export async function getStaticMap(lat, lng) {
  // Round to ~1 m so tiny float differences reuse the same cached image.
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (cache.has(key)) return cache.get(key);

  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) throw new Error('GEOAPIFY_API_KEY is missing from backend/.env');

  const params = new URLSearchParams({
    style: 'osm-bright',
    width: String(WIDTH),
    height: String(HEIGHT),
    center: `lonlat:${lng},${lat}`,
    zoom: String(ZOOM),
    marker: `lonlat:${lng},${lat};type:material;color:${PIN_COLOR};size:48`,
    format: 'jpeg', // about half the size of png
    apiKey,
  });

  const response = await fetch(`https://maps.geoapify.com/v1/staticmap?${params}`);
  if (!response.ok) {
    throw new Error(`Geoapify error ${response.status}: ${await response.text()}`);
  }

  const image = Buffer.from(await response.arrayBuffer());

  // Drop the oldest image when the cache is full so memory stays small.
  if (cache.size >= MAX_CACHED_IMAGES) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, image);
  return image;
}
