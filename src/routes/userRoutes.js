import { Router } from 'express';
import UserController from '../controllers/usersController.js';
// import { validateRegister, validateLogin } from '../middlewares/validation.js';
// import { authenticate } from '../middlewares/auth.js';

const router = Router();

// Public routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// // Public routes
// router.post('/register', validateRegister, UserController.register);
// router.post('/login', validateLogin, UserController.login);

// Protected routes (require authentication)
// router.use(authenticate);

router.get('/me', UserController.getProfile);
router.patch('/me', UserController.updateProfile);
router.delete('/me', UserController.deleteAccount);

export default router;