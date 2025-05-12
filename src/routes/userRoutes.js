import { Router } from 'express';
import UserController from '../controllers/usersController.js'
import Validator from '../middlewares/validation.js';

const usersRouter = Router();

usersRouter.route('/register')
  .post(Validator.validateRegister, UserController.register)

usersRouter.route('/login')
  .post(Validator.validateLogin, UserController.login)

usersRouter.route('/update')
  .patch(Validator.validateUpdate, UserController.update)


usersRouter.route('/') //?id=
  .delete(UserController.delete);

export default usersRouter;




// template bellow 

// import { Router } from 'express';
// import UserController from '../controllers/usersController.js';
// import Validator from '../middlewares/validation.js';
// import AuthMiddleware from '../middlewares/auth.js'; // Optional auth middleware

// const router = Router();

// // Public routes (no authentication required)
// router.post('/register', Validator.validateRegister, UserController.register);
// router.post('/login', Validator.validateLogin, UserController.login);

// // Authenticated routes (protected by JWT)
// router.use(AuthMiddleware.verifyToken); // Applies to all routes below

// // User profile operations
// router.route('/me')
//   .get(UserController.getProfile)       // GET /users/me - Get current user
//   .patch(Validator.validateUpdate, UserController.updateProfile) // PATCH /users/me
//   .delete(UserController.deleteProfile); // DELETE /users/me

// // Admin-only routes (example)
// router.use(AuthMiddleware.restrictTo('admin')); // Additional protection
// router.route('/')
//   .get(UserController.getAllUsers); // GET /users - Admin only

// router.route('/:id')
//   .get(UserController.getUser)     // GET /users/:id - Admin only
//   .delete(UserController.deleteUser); // DELETE /users/:id - Admin only

// export default router;