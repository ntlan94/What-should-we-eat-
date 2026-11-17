/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/pages/Match.js
 * Description: Celebration screen displayed when all room members agree.
 * Author: Thanh Lan Ngo
 * Colaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Latest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

import Button from '../components/Button.js';
import { escapeHtml } from '../utils/html.js';

export default class Match {
  constructor({ restaurant, roomCode, onRestart }) {
    this.restaurant = restaurant;
    this.roomCode = roomCode;
    this.onRestart = onRestart;
  }

  render() {
    const screen = document.createElement('div');
    screen.className =
      'w-full max-w-md bg-gradient-to-br from-orange-500 to-rose-600 rounded-3xl p-6 text-white text-center shadow-2xl animate-fade-in';

    screen.innerHTML = `
      <div class="inline-block bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm mb-4 border border-white/30">
        <span class="font-extrabold tracking-widest uppercase text-xs">
          Room ${this.roomCode} • Match Found!
        </span>
      </div>

      <h1 class="text-3xl font-black mb-1 drop-shadow-sm">We Have a Winner!</h1>
      <p class="text-orange-100 font-medium text-sm mb-6">
        Everyone swiped right on this spot:
      </p>

      <!-- Matched Restaurant Card -->
      <div class="w-full bg-white p-4 rounded-3xl shadow-2xl text-slate-800 mb-6">
        <div class="aspect-[4/3] bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
          <img
            src="${escapeHtml(this.restaurant.image)}"
            alt="${escapeHtml(this.restaurant.name)}"
            class="w-full h-full object-cover"
          />
          ${Number.isFinite(this.restaurant.rating) ? `
            <span class="absolute top-3 right-3 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow">
              ★ ${escapeHtml(this.restaurant.rating)}
            </span>
          ` : ''}
        </div>

        <div class="text-left px-1">
          <h2 class="text-2xl font-black text-slate-900">          ${escapeHtml(this.restaurant.name)}</h2>
          <p class="text-xs font-bold text-orange-600 mt-0.5 mb-2">
            ${escapeHtml(this.restaurant.cuisine || 'Restaurant')} • ${escapeHtml(this.restaurant.address || '')}
          </p>
          <p class="text-sm text-slate-600 leading-relaxed">
            ${escapeHtml(this.restaurant.description)}
          </p>
        </div>
      </div>

      <div id="match-actions" class="space-y-3"></div>
    `;

    const actionsContainer = screen.querySelector('#match-actions');

    const mapButton = new Button({
      text: '📍 Get Directions in Google Maps',
      variant: 'neutral',
      onClick: () => {
        const query = encodeURIComponent(
          `${this.restaurant.name} ${this.restaurant.address || ''}`
        );
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
      }
    });
    actionsContainer.appendChild(mapButton.render());

    const restartBtn = document.createElement('button');
    restartBtn.type = 'button';
    restartBtn.className =
      'block w-full text-xs font-bold text-orange-100 hover:text-white underline pt-2 cursor-pointer';
    restartBtn.textContent = 'Start a New Room';
    restartBtn.addEventListener('click', () => {
      if (this.onRestart) this.onRestart();
    });
    actionsContainer.appendChild(restartBtn);

    return screen;
  }
}
