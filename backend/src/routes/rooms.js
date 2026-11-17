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