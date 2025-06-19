import { Router } from 'express';
import { signup, login, logout  } from '../controllers/auth.controller.js';
import { getMe } from "../controllers/auth.controller.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout );
router.get("/me", verifyToken, getMe);



export default router;
