import { Article } from '../models/schema.js';
import AppError from '../utils/error/AppError.js';
import mongoose from 'mongoose';

/**
 * Article Controller Class
 * @class ArticleController
 * @description Handles all article-related operations including creation, retrieval,
 * updates, deletion, and author-specific queries. Implements proper authorization
 * checks and publishing workflow.
 */
class ArticleController {
  /**
   * Create a new article
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @description Creates either a draft or published article based on status.
   * Automatically sets the author to the authenticated user.
   */
  createArticle = async (req, res, next) => {
    try {
      const { title, content, excerpt, tags, status } = req.body;
      
      const article = await Article.create({
        title,
        content,
        excerpt,
        tags,
        author: req.user.id, // Set author to authenticated user
        status: status || 'draft', // Default to draft if not specified
        publishedAt: status === 'published' ? Date.now() : null, // Set publish date if publishing
        featuredImage: req.body.featuredImage,
        seoTitle: req.body.seoTitle,
        seoDescription: req.body.seoDescription
      });

      res.status(201).json({
        status: 'success',
        data: { article }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated list of published articles
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @description Returns paginated results of published articles sorted by publish date (newest first).
   * Supports page and limit query parameters.
   */
  getAllArticles = async (req, res, next) => {
    try {
      // Pagination parameters with defaults
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const articles = await Article.find({ status: 'published' })
        .sort('-publishedAt') // Newest first
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName'); // Basic author info

      res.json({
        status: 'success',
        results: articles.length,
        data: { articles }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single article by ID or slug
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If article not found
   * @description Finds article by either MongoDB ID or slug. Increments view count on access.
   * Only returns published articles.
   */
  getArticle = async (req, res, next) => {
    try {
      let article;
      const identifier = req.params.id;
      
      // Check if identifier is a valid MongoDB ID
      if (mongoose.isValidObjectId(identifier)) {
        article = await Article.findOne({
          $or: [
            { _id: identifier },
            { slug: identifier }
          ],
          status: 'published'
        }).populate('author', 'firstName lastName');
      } else {
        // Search by slug only
        article = await Article.findOne({
          slug: identifier,
          status: 'published'
        }).populate('author', 'firstName lastName');
      }

      if (!article) {
        return next(new AppError('Article not found', 404));
      }

      // Increment view count and save
      article.viewCount += 1;
      await article.save({ validateBeforeSave: false });

      res.json({
        status: 'success',
        data: { article }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an article
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If article not found or user not authorized
   * @description Only allows the original author to update the article.
   * Updates publishedAt date if status changes to 'published'.
   */
  updateArticle = async (req, res, next) => {
    try {
      const { title, content, excerpt, tags, status } = req.body;
      
      const article = await Article.findOneAndUpdate(
        { 
          _id: req.params.id,
          author: req.user.id // Ensure user is the original author
        },
        {
          title,
          content,
          excerpt,
          tags,
          status,
          publishedAt: status === 'published' ? Date.now() : null // Update publish date if publishing
        },
        { 
          new: true, // Return updated document
          runValidators: true // Validate updated fields
        }
      );

      if (!article) {
        return next(new AppError('Article not found or not authorized', 404));
      }

      res.json({
        status: 'success',
        data: { article }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Soft delete an article (archive)
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @throws {AppError} 404 - If article not found or user not authorized
   * @description Archives the article by changing its status rather than deleting.
   * Only allows the original author to perform this action.
   */
  deleteArticle = async (req, res, next) => {
    try {
      const article = await Article.findOneAndUpdate(
        { 
          _id: req.params.id,
          author: req.user.id // Ensure user is the original author
        },
        { status: 'archived' }, // Soft delete by archiving
        { new: true }
      );

      if (!article) {
        return next(new AppError('Article not found or not authorized', 404));
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
   * Get all published articles by a specific author
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   * @returns {Promise<void>}
   * @description Returns all published articles by the specified author,
   * sorted by publish date (newest first).
   */
  getArticlesByAuthor = async (req, res, next) => {
    try {
      const articles = await Article.find({
        author: req.params.userId,
        status: 'published'
      }).sort('-publishedAt');

      res.json({
        status: 'success',
        results: articles.length,
        data: { articles }
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
export default new ArticleController();