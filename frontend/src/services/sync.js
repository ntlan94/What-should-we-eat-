/**
 * Project: What Should We Eat?
 * File: frontend/src/services/sync.js
 * Description: Polls the backend for room updates.
 * Modified by: Thanh Lan Ngo
 */

import { fetchRoom } from './api.js';

export function joinRoomSync(room, onRoomUpdated) {
  let stopped = false;
  let syncing = false;
  let knownMemberCount = room.members.length;

  const sync = async () => {
    if (stopped || syncing) return;
    syncing = true;
    try {
      const state = await fetchRoom(room.code);
      if (stopped) return;
      room.updateFromServer(state);

      if (room.members.length > knownMemberCount) {
        knownMemberCount = room.members.length;
        onRoomUpdated({ type: 'MEMBER_JOINED', memberCount: knownMemberCount });
      } else {
        knownMemberCount = room.members.length;
      }
      if (room.matchedRestaurant) {
        onRoomUpdated({ type: 'MATCH_FOUND', restaurant: room.matchedRestaurant });
      }
    } catch (error) {
      if (!stopped) onRoomUpdated({ type: 'SYNC_ERROR', error });
    } finally {
      syncing = false;
    }
  };

  const timerId = setInterval(sync, 2000);
  return () => {
    stopped = true;
    clearInterval(timerId);
  };
}
