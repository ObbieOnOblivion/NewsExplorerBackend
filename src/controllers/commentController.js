import { Comment, Article } from '../models/schema.js';
import AppError from '../utils/error/AppError.js';

/**
 * Comment Controller Class
 * @class CommentController
 * @description Handles all comment-related operations including creation, retrieval,
 * updates, deletion, and moderation. Implements proper authorization checks and
 * hierarchical comment structures.
 */
class CommentController {
  /**
   * Create a new comment on an article
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If article or parent comment not found
   * @description Creates either a top-level comment or a reply to an existing comment.
   * Auto-approves comments from non-regular users (admins/moderators).
   */
  async createComment(req, res, next) {
    try {
      const { content, parentComment } = req.body;
      
      // Verify referenced article exists
      const article = await Article.findById(req.params.articleId);
      if (!article) {
        return next(new AppError('Article not found', 404));
      }

      // Validate parent comment if this is a reply
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
        isApproved: req.user.role !== 'user' // Auto-approve for privileged users
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
   * Retrieve all approved comments for an article
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @description Returns a hierarchical structure of comments with populated user details.
   * Only includes approved, top-level comments with their nested replies.
   */
  async getArticleComments(req, res, next) {
    try {
      const comments = await Comment.find({
        article: req.params.articleId,
        isApproved: true,
        parentComment: null // Only fetch top-level comments
      })
        .populate('user', 'firstName lastName') // Basic user info
        .populate({
          path: 'replies',
          populate: { path: 'user', select: 'firstName lastName' }
        })
        .sort('-createdAt'); // Newest first

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
   * Update a comment's content
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If comment not found or user not authorized
   * @description Only allows the original comment author to update the content.
   * Validates the new content against the schema.
   */
  async updateComment(req, res, next) {
    try {
      const comment = await Comment.findOneAndUpdate(
        { 
          _id: req.params.commentId,
          user: req.user.id // Ensure user owns the comment
        },
        { content: req.body.content },
        { 
          new: true, // Return updated document
          runValidators: true // Validate updated content
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
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If comment not found or user not authorized
   * @description Regular users can only delete their own comments. Admins/moderators
   * can delete any comment. Returns 204 No Content on success.
   */
  async deleteComment(req, res, next) {
    try {
      const conditions = { _id: req.params.commentId };
      
      // Apply ownership restriction for regular users
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
   * Moderate a comment (approve/reject)
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If comment not found
   * @description Restricted to admin/moderator roles. Updates the approval status
   * of a comment and returns the modified comment.
   */
  async moderateComment(req, res, next) {
    try {
      const { isApproved } = req.body;
      
      const comment = await Comment.findByIdAndUpdate(
        req.params.commentId,
        { isApproved },
        { new: true } // Return the updated document
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

// Export singleton instance
export default new CommentController();