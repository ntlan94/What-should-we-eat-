/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/components/SwipeCard.js
 * Description: Tinder-style swipeable restaurant card component.
 * Author: Thanh Lan Ngo
 * Collaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Latest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

import { escapeHtml } from '../utils/html.js';

export default class SwipeCard {
  constructor({ restaurant, onSwipe }) {
    this.restaurant = restaurant;
    this.onSwipe = onSwipe;
  }

  render() {
    const card = document.createElement('div');
    card.className =
      'relative w-full max-w-sm aspect-[3/4] bg-white rounded-3xl shadow-2xl shadow-orange-500/10 overflow-hidden border border-orange-100 mx-auto animate-fade-in';

    card.innerHTML = `
      <!-- Restaurant Cover Photo -->
      <div class="absolute inset-0 bg-slate-200">
        <img
          src="${escapeHtml(this.restaurant.image)}"
          alt="${escapeHtml(this.restaurant.name)}"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/35 to-transparent"></div>
      </div>

      <!-- Top Price & Rating Badges -->
      <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
        <span class="bg-black/45 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/15">
          ${escapeHtml(this.restaurant.cuisine || 'Restaurant')}
        </span>
        ${Number.isFinite(this.restaurant.rating) ? `
          <span class="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-full shadow-md">
            ★ ${escapeHtml(this.restaurant.rating)}
          </span>
        ` : ''}
      </div>

      <!-- Restaurant Details & Swipe Buttons -->
      <div class="absolute bottom-0 w-full p-6 text-white">
        <h2 class="text-2xl font-black leading-tight drop-shadow-sm mb-1">
          ${escapeHtml(this.restaurant.name)}
        </h2>
        <p class="text-xs text-orange-200 font-semibold mb-2">
          ${escapeHtml(this.restaurant.address)}
        </p>
        <p class="text-white/85 text-sm leading-relaxed mb-6 line-clamp-2">
          ${escapeHtml(this.restaurant.description)}
        </p>

        <div class="flex justify-center items-center gap-8">
          <button
            type="button"
            id="btn-swipe-left"
            aria-label="Pass"
            class="w-16 h-16 bg-white/95 hover:bg-white rounded-full flex items-center justify-center text-rose-500 shadow-xl text-2xl font-black active:scale-90 transition-all cursor-pointer"
          >
            ✕
          </button>
          <button
            type="button"
            id="btn-swipe-right"
            aria-label="Like"
            class="w-16 h-16 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-500/40 text-2xl active:scale-90 transition-all cursor-pointer"
          >
            ♥
          </button>
        </div>
      </div>
    `;

    card.querySelector('#btn-swipe-left').addEventListener('click', () => {
      if (this.onSwipe) this.onSwipe('left');
    });

    card.querySelector('#btn-swipe-right').addEventListener('click', () => {
      if (this.onSwipe) this.onSwipe('right');
    });

    return card;
  }
}
