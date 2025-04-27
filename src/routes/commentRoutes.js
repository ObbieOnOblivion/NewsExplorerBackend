import { Router } from 'express';
import CommentController from '../controllers/commentController.js';
// import { authenticate } from '../middlewares/auth.js';
// import { validateComment } from '../middlewares/validation.js';

const router = Router();

// Public routes
router.get('/articles/:articleId/comments', CommentController.getArticleComments);

// Protected routes
// router.use(authenticate);

// router.post(
//   '/articles/:articleId/comments', 
//   validateComment, 
//   commentController.addComment
// );
// router.patch(
//   '/comments/:commentId', 
//   validateComment, 
//   commentController.updateComment
// );
// router.delete('/comments/:commentId', commentController.deleteComment);

export default router;