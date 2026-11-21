/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/models/User.js
 * Description: OOP Model class for user state (id, name, host status, swipes).
 * Author: Thanh Lan Ngo
 * Collaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Last Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

export default class User {
  constructor(id, name = 'Guest', isHost = false) {
    this.id = id;
    this.name = name;
    this.isHost = isHost;
    this.swipes = {}; // Maps restaurantId -> 'left' | 'right'
  }

  recordSwipe(restaurantId, direction) {
    this.swipes[restaurantId] = direction;
  }

  hasLiked(restaurantId) {
    return this.swipes[restaurantId] === 'right';
  }
}
