/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/pages/SwipeRoom.js
 * Description: Active multiplayer swipe screen displaying restaurant cards.
 * Author: Thanh Lan Ngo
 * Collaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Latest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

import Navbar from '../components/Navbar.js';
import SwipeCard from '../components/SwipeCard.js';
import Button from '../components/Button.js';
import { joinRoomSync } from '../services/sync.js';
import { submitSwipe } from '../services/api.js';
import { escapeHtml } from '../utils/html.js';

export default class SwipeRoom {
  constructor({ room, currentUser, onMatchFound, onLeave }) {
    this.room = room;
    this.currentUser = currentUser;
    this.onMatchFound = onMatchFound;
    this.onLeave = onLeave;

    this.currentIndex = 0;
    this.unsubscribeSync = null;
    this.isSubmitting = false;

    this.wrapper = document.createElement('div');
    this.wrapper.className = 'w-full max-w-md mx-auto flex flex-col justify-between min-h-[90vh]';
  }

  async handleSwipe(direction) {
    const currentRestaurant = this.room.deck[this.currentIndex];
    if (!currentRestaurant || this.isSubmitting) return;

    this.isSubmitting = true;
    try {
      const state = await submitSwipe(
        this.room.code,
        this.currentUser.id,
        currentRestaurant.id,
        direction
      );
      this.room.updateFromServer(state);

      if (this.room.matchedRestaurant) {
        this.cleanup();
        this.onMatchFound(this.room.matchedRestaurant);
        return;
      }

      this.currentIndex += 1;
      this.renderDeckArea();
    } catch (error) {
      const toastBanner = this.wrapper.querySelector('#sync-toast');
      toastBanner.textContent = error.message;
      toastBanner.classList.remove('hidden');
    } finally {
      this.isSubmitting = false;
    }
  }

  cleanup() {
    if (this.unsubscribeSync) {
      this.unsubscribeSync();
      this.unsubscribeSync = null;
    }
  }

  renderDeckArea() {
    const stage = this.wrapper.querySelector('#swipe-stage');
    stage.innerHTML = '';

    if (this.currentIndex < this.room.deck.length) {
      const currentRestaurant = this.room.deck[this.currentIndex];

      const metaBar = document.createElement('div');
      metaBar.className = 'flex justify-between items-center w-full max-w-sm mx-auto mb-3 px-1';
      metaBar.innerHTML = `
        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
          Near ${escapeHtml(this.room.location)} (${escapeHtml(this.room.radius)} km)
        </span>
        <span class="text-xs font-extrabold text-orange-600 bg-orange-100/80 px-2.5 py-1 rounded-full">
          ${this.currentIndex + 1} / ${this.room.deck.length}
        </span>
      `;
      stage.appendChild(metaBar);

      const card = new SwipeCard({
        restaurant: currentRestaurant,
        onSwipe: (dir) => this.handleSwipe(dir)
      });
      stage.appendChild(card.render());
    } else {
      const emptyBox = document.createElement('div');
      emptyBox.className =
        'w-full max-w-sm mx-auto bg-white p-8 rounded-3xl shadow-xl text-center border border-orange-100 animate-fade-in';
      emptyBox.innerHTML = `
        <div class="text-5xl mb-4" role="img" aria-label="hourglass">⏳</div>
        <h3 class="text-xl font-black text-slate-800 mb-2">Out of Cards!</h3>
        <p class="text-slate-500 text-sm mb-6">
          No unanimous match yet. You can swipe through the deck again or pick a new location.
        </p>
        <div id="retry-actions" class="space-y-3"></div>
      `;

      const actionsSlot = emptyBox.querySelector('#retry-actions');
      const retryBtn = new Button({
        text: 'Swipe Deck Again',
        variant: 'primary',
        onClick: () => {
          this.currentIndex = 0;
          this.renderDeckArea();
        }
      });
      const leaveBtn = new Button({
        text: 'Change Location',
        variant: 'neutral',
        onClick: () => {
          this.cleanup();
          this.onLeave();
        }
      });

      actionsSlot.appendChild(retryBtn.render());
      actionsSlot.appendChild(leaveBtn.render());
      stage.appendChild(emptyBox);
    }
  }

  render() {
    this.wrapper.innerHTML = '';

    const navbar = new Navbar({
      roomCode: this.room.code,
      memberCount: this.room.members.length,
      onLeave: () => {
        this.cleanup();
        this.onLeave();
      }
    });
    this.wrapper.appendChild(navbar.render());

    const toastBanner = document.createElement('div');
    toastBanner.id = 'sync-toast';
    toastBanner.className =
      'hidden w-full max-w-sm mx-auto mb-3 py-2 px-4 bg-emerald-500 text-white text-xs font-bold rounded-full text-center shadow-md animate-fade-in';
    this.wrapper.appendChild(toastBanner);

    const stage = document.createElement('div');
    stage.id = 'swipe-stage';
    stage.className = 'flex-1 flex flex-col justify-center w-full';
    this.wrapper.appendChild(stage);

    this.renderDeckArea();

    // Poll the backend so members see room changes and matches.
    this.unsubscribeSync = joinRoomSync(this.room, (event) => {
      navbar.updateMemberCount(this.room.members.length);
      if (event.type === 'MEMBER_JOINED') {
        toastBanner.textContent = `${event.memberCount} foodies are in the room!`;
        toastBanner.classList.remove('hidden');
        setTimeout(() => toastBanner.classList.add('hidden'), 3000);
      } else if (event.type === 'MATCH_FOUND') {
        this.cleanup();
        this.onMatchFound(event.restaurant);
      } else if (event.type === 'SYNC_ERROR') {
        toastBanner.textContent = `Room sync failed: ${event.error.message}`;
        toastBanner.classList.remove('hidden');
      }
    });

    return this.wrapper;
  }
}
