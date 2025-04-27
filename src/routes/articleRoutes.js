import { Router } from 'express';
// Then in articleRoutes.js:
import ArticleController from '../controllers/articleController.js';// import { authenticate } from '../middlewares/auth.js';
// import { 
//   validateArticleCreate, 
//   validateArticleUpdate 
// } from '../middlewares/validation.js';

const router = Router();

// Public routes
router.get('/', ArticleController.getAllArticles);
router.get('/:id', ArticleController.getArticle);

// Protected routes
// router.use(authenticate);

// router.post('/', validateArticleCreate, ArticleController.createArticle);
// router.patch('/:id', validateArticleUpdate, ArticleController.updateArticle);
// router.delete('/:id', ArticleController.deleteArticle);

export default router;