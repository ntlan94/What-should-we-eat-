/**
 * ============================================================================
 * Project: What Should We Eat?
 * File: frontend/src/services/sync.js
 * Description: Real-time room synchronization service (Firebase/Supabase ready).
 * Author: Thanh Lan Ngo
 * Colaborators: Jovian Niko Soesilo
 * Date Created: 2026-11-16
 * Lastest Modified: 2026-11-17
 * Modified by: Thanh Lan Ngo
 * ============================================================================
 */

export function joinRoomSync(room, onRoomUpdated) {
  console.log(`[SYNC] Subscribed to live updates for room ${room.code}`);

  // Simulate a friend joining and liking two spots so you can test matches
  const timerId = setTimeout(() => {
    room.addMember({ id: 'friend-1', name: 'Sarah', isHost: false });
    room.votes['rest-2'] = (room.votes['rest-2'] || 0) + 1;
    room.votes['rest-3'] = (room.votes['rest-3'] || 0) + 1;

    if (onRoomUpdated) {
      onRoomUpdated({ type: 'MEMBER_JOINED', memberName: 'Sarah' });
    }
  }, 1200);

  return () => {
    clearTimeout(timerId);
    console.log(`[SYNC] Unsubscribed from room ${room.code}`);
  };
}
