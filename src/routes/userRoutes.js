import { Router } from 'express';
import UserController from '../controllers/usersController.js'
import Validator from '../middlewares/validation.js';

const usersRouter = Router();
// const userController = new UserController(); // Create an instance


usersRouter.route('/me')
  .post(Validator.validateRegister ,UserController.register)
//   .patch(usersController.updateProfile)

usersRouter.route('/') //?id=
  .delete(UserController.delete);
  
export default usersRouter;