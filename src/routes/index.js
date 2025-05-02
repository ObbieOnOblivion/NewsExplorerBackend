import { Router } from 'express';
import userRoutes from './userRoutes.js';
import articleRoutes from './articleRoutes.js';
import commentRoutes from './commentRoutes.js';

const router = Router();

// API status endpoint
router.get('/status', (req, res) => res.json({ status: 'OK' }));

// Feature routes
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
// router.use('/', commentRoutes); // comments are nested under articles
export default router;