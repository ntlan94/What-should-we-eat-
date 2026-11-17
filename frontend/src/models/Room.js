/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/models/Room.js
 * Description: OOP Model class managing room code, members, deck, and matches.
 * Author: Thanh Lan Ngo
 * Colaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Last Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

export default class Room {
  constructor(code, location = 'Nearby', radius = 3) {
    this.code = code;
    this.location = location;
    this.radius = radius;
    this.members = [];
    this.deck = [];
    this.votes = {}; // Maps restaurantId -> count of 'right' votes
    this.status = 'lobby'; // 'lobby' | 'swiping' | 'matched'
    this.matchedRestaurant = null;
  }

  addMember(user) {
    const exists = this.members.some((member) => member.id === user.id);
    if (!exists) {
      this.members.push(user);
    }
  }

  setDeck(restaurants) {
    this.deck = restaurants;
    this.status = 'swiping';
  }

  recordVote(restaurantId, direction) {
    if (direction === 'right') {
      this.votes[restaurantId] = (this.votes[restaurantId] || 0) + 1;
    }
    return this.checkForMatch(restaurantId);
  }

  checkForMatch(restaurantId) {
    const totalMembers = Math.max(this.members.length, 1);
    if ((this.votes[restaurantId] || 0) >= totalMembers) {
      this.status = 'matched';
      this.matchedRestaurant = this.deck.find((r) => r.id === restaurantId) || null;
      return this.matchedRestaurant;
    }
    return null;
  }
}
