/**
 * Project: What Should We Eat?
 * File: backend/src/routes/rooms.js
 * Description: Express routes for room actions.
 * Modified by: Thanh Lan Ngo
 */

import { Router } from 'express';
import {
  createRoomHandler,
  getRoomHandler,
  joinRoomHandler,
  swipeHandler,
} from '../controllers/roomController.js';

const router = Router();

router.post('/', createRoomHandler);
router.get('/:code', getRoomHandler);
router.post('/:code/join', joinRoomHandler);
router.post('/:code/swipes', swipeHandler);

export default router;