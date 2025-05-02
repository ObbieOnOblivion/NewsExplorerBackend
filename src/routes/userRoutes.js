import { Router } from 'express';
import UserController from '../controllers/usersController.js';
// import { validateRegister, validateLogin } from '../middlewares/validation.js';
// import { authenticate } from '../middlewares/auth.js';

const userRoutes = Router();

// Public routes
userRoutes.post('/register', UserController.register); 
userRoutes.post('/login', UserController.login);

// // Public routes
// router.post('/register', validateRegister, UserController.register);
// router.post('/login', validateLogin, UserController.login);

// Protected routes (require authentication)
// router.use(authenticate);

userRoutes.get('/me', UserController.getProfile);
userRoutes.patch('/me', UserController.updateProfile);
userRoutes.delete('/me', UserController.deleteAccount);

export default userRoutes;