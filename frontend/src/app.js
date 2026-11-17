/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/app.js
 * Description: Main frontend application controller coordinating views & models.
 * Author: Thanh Lan Ngo
 * Colaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Latest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

import User from './models/User.js';
import Room from './models/Room.js';
import { fetchRestaurants } from './services/api.js';

import Home from './pages/Home.js';
import SwipeRoom from './pages/SwipeRoom.js';
import Match from './pages/Match.js';

class AppController {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.currentUser = null;
    this.activeRoom = null;
    this.matchedRestaurant = null;
  }

  init() {
    this.showHome();
  }

  mount(element) {
    this.rootElement.innerHTML = '';
    this.rootElement.appendChild(element);
  }

  showHome() {
    const homePage = new Home({
      onCreateRoom: (data) => this.handleCreateRoom(data),
      onJoinRoom: (data) => this.handleJoinRoom(data)
    });
    this.mount(homePage.render());
  }

  async handleCreateRoom({ location, radius }) {
    const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    this.currentUser = new User('user-1', 'Host', true);
    this.activeRoom = new Room(generatedCode, location, radius);
    this.activeRoom.addMember(this.currentUser);

    const restaurants = await fetchRestaurants(location, radius);
    this.activeRoom.setDeck(restaurants);

    this.showSwipeRoom();
  }

  async handleJoinRoom({ roomCode }) {
    this.currentUser = new User('user-2', 'Member', false);
    this.activeRoom = new Room(roomCode, 'Host Neighborhood', 3);
    this.activeRoom.addMember(this.currentUser);

    const restaurants = await fetchRestaurants('Host Neighborhood', 3);
    this.activeRoom.setDeck(restaurants);

    this.showSwipeRoom();
  }

  showSwipeRoom() {
    const swipeRoomPage = new SwipeRoom({
      room: this.activeRoom,
      currentUser: this.currentUser,
      onMatchFound: (restaurant) => this.showMatch(restaurant),
      onLeave: () => this.showHome()
    });
    this.mount(swipeRoomPage.render());
  }

  showMatch(restaurant) {
    this.matchedRestaurant = restaurant;
    const matchPage = new Match({
      restaurant: this.matchedRestaurant,
      roomCode: this.activeRoom.code,
      onRestart: () => this.showHome()
    });
    this.mount(matchPage.render());
  }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  const app = new AppController(root);
  app.init();
});
