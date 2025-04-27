import { Comment, Article } from '../models/schema.js';
import AppError from '../utils/error/AppError.js';

class CommentController {
  /**
   * Create a new comment
   */
  async createComment(req, res, next) {
    try {
      const { content, parentComment } = req.body;
      
      // Verify article exists
      const article = await Article.findById(req.params.articleId);
      if (!article) {
        return next(new AppError('Article not found', 404));
      }

      // Verify parent comment exists if provided
      if (parentComment) {
        const parentExists = await Comment.findById(parentComment);
        if (!parentExists) {
          return next(new AppError('Parent comment not found', 404));
        }
      }

      const comment = await Comment.create({
        content,
        article: req.params.articleId,
        user: req.user.id,
        parentComment: parentComment || null,
        isApproved: req.user.role !== 'user' // Auto-approve for admins/moderators
      });

      res.status(201).json({
        status: 'success',
        data: { comment }
      }); 
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get comments for an article
   */
  async getArticleComments(req, res, next) {
    try {
      const comments = await Comment.find({
        article: req.params.articleId,
        isApproved: true,
        parentComment: null // Only top-level comments
      })
        .populate('user', 'firstName lastName')
        .populate({
          path: 'replies',
          populate: { path: 'user', select: 'firstName lastName' }
        })
        .sort('-createdAt');

      res.json({
        status: 'success',
        results: comments.length,
        data: { comments }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a comment
   */
  async updateComment(req, res, next) {
    try {
      const comment = await Comment.findOneAndUpdate(
        { 
          _id: req.params.commentId,
          user: req.user.id 
        },
        { content: req.body.content },
        { 
          new: true,
          runValidators: true 
        }
      );

      if (!comment) {
        return next(new AppError('Comment not found or not authorized', 404));
      }

      res.json({
        status: 'success',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(req, res, next) {
    try {
      const conditions = { _id: req.params.commentId };
      
      // Regular users can only delete their own comments
      if (req.user.role === 'user') {
        conditions.user = req.user.id;
      }

      const comment = await Comment.findOneAndDelete(conditions);

      if (!comment) {
        return next(new AppError('Comment not found or not authorized', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Approve/reject comment (admin/moderator only)
   */
  async moderateComment(req, res, next) {
    try {
      const { isApproved } = req.body;
      
      const comment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        { isApproved },
        { new: true }
      );

      if (!comment) {
        return next(new AppError('Comment not found', 404));
      }

      res.json({
        status: 'success',
        data: { comment }
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new CommentController();