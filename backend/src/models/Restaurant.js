/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: backend/src/models/Restaurant.js
 * Description: Standard restaurant format sent to the frontend swipe cards.
 *              Geoapify has no photos or ratings, so the frontend picks a stock
 *              image from assets/ based on `cuisine`.
 * Author: Jovian Niko Soesilo
 * Date Created: 2026-11-17
 * Last Modified: 2026-11-17
 * Modified by: Jovian Niko Soesilo
 * ============================================================================
 */

export default class Restaurant {
  constructor({ id, name, cuisine, distance, address, openingHours, lat, lng }) {
    this.id = id;
    this.name = name;
    this.cuisine = cuisine;           // e.g. "pizza", "sushi", "fast_food", "cafe"
    this.distance = distance;         // metres from the search point
    this.address = address;
    this.openingHours = openingHours; // raw OpenStreetMap format, or null
    this.lat = lat;
    this.lng = lng;
  }

  static fromGeoapify(feature) {
    const p = feature.properties;
    return new Restaurant({
      id: p.place_id,
      name: p.name,
      cuisine: Restaurant.#cuisineFrom(p),
      distance: p.distance ?? null,
      address: p.address_line2 ?? p.formatted ?? null,
      openingHours: p.opening_hours ?? null,
      lat: p.lat,
      lng: p.lon,
    });
  }

  // Prefer the OSM cuisine tag, else fall back to the category name.
  static #cuisineFrom(p) {
    const tag = p.catering?.cuisine;
    if (tag) return String(tag).split(';')[0];

    const categories = p.categories ?? [];
    const specific = categories.find((c) => c.startsWith('catering.restaurant.'));
    if (specific) return specific.split('.').pop();
    if (categories.includes('catering.fast_food')) return 'fast_food';
    if (categories.includes('catering.cafe')) return 'cafe';
    return 'restaurant';
  }
}
