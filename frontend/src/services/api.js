/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/services/api.js
 * Description: API service layer to fetch restaurant data from backend.
 * Author: Thanh Lan Ngo
 * Date Created: 2026-11-16
 * Latest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

export async function fetchRestaurants(location, radius) {
  console.log(`[API] Fetching restaurants within ${radius}km of "${location}"...`);

  // Simulated network delay before backend is connected
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 'rest-1',
      name: "Mario's Woodfire Pizza",
      rating: 4.7,
      price: '$$',
      address: `142 High St, ${location}`,
      description: 'Wood-fired Neapolitan pizzas, handmade burrata, and fresh basil pasta.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rest-2',
      name: 'Soi 38 Thai Street Food',
      rating: 4.8,
      price: '$',
      address: `88 Market Ln, ${location}`,
      description: 'Authentic boat noodles, crispy pork belly, and spicy green papaya salad.',
      image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rest-3',
      name: 'Stacked Smash Burgers',
      rating: 4.5,
      price: '$$',
      address: `19 Station Rd, ${location}`,
      description: 'Double wagyu smash patties with crispy lacy edges, house pickles, and fries.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'rest-4',
      name: 'Taco Cartel',
      rating: 4.6,
      price: '$$',
      address: `305 Victoria St, ${location}`,
      description: 'Slow-braised birria tacos with consomé dip, fresh guacamole, and churros.',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80'
    }
  ];
}
