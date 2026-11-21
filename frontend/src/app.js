/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/app.js
 * Description: Main frontend application controller coordinating views & models.
 * Author: Thanh Lan Ngo
 * Collaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Latest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

import User from './models/User.js';
import Room from './models/Room.js';
import { createRoom, joinRoom } from './services/api.js';

import Home from './pages/Home.js';
import SwipeRoom from './pages/SwipeRoom.js';
import Match from './pages/Match.js';

function getMemberId() {
  let memberId = sessionStorage.getItem('wswe-member-id');
  if (!memberId) {
    memberId = crypto.randomUUID();
    sessionStorage.setItem('wswe-member-id', memberId);
  }
  return memberId;
}

function roomFromServer(state) {
  const room = new Room(state.code, state.location, state.radiusKm);
  room.updateFromServer(state);
  return room;
}

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
    this.currentUser = new User(getMemberId(), 'Host', true);
    const state = await createRoom({
      location,
      radiusKm: radius,
      member: { id: this.currentUser.id, name: this.currentUser.name },
    });
    this.activeRoom = roomFromServer(state);

    this.showSwipeRoom();
  }

  async handleJoinRoom({ roomCode }) {
    this.currentUser = new User(getMemberId(), 'Guest', false);
    const state = await joinRoom(roomCode, {
      id: this.currentUser.id,
      name: this.currentUser.name,
    });
    this.activeRoom = roomFromServer(state);

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
