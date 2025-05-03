import { Router } from 'express';
import express from 'express';
import usersRouter from '../routes/userRoutes.js'

import usersController from "../controllers/usersController.js"
const router = Router();

// Base routes
router.use(express.json()); // Parse JSON bodies
router.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// router.route('/users').post(usersController.register);         // POST /api/users
router.use('/users', usersRouter);
// router.use('/articles', articlesRouter);

export default router;