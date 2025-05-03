import { Router } from 'express';
import usersController from '../controllers/usersController.js';
// import { validateRegister, validateLogin } from '../middlewares/validation.js';

const usersRouter = Router();

usersRouter.route('/me')
  .post(usersController.register)
//   .patch(usersController.updateProfile)
//   .delete(usersController.deleteAccount);

export default usersRouter;