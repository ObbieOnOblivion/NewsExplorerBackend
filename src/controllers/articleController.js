import { Article } from '../models/schema.js'; // Fixed typo in filename
import AppError from '../utils/error/AppError.js';
import mongoose from 'mongoose';

class ArticleController {
  /**
   * Create a new article
   */
  createArticle = async (req, res, next) => {
    try {
      const { title, content, excerpt, tags, status } = req.body;
      
      const article = await Article.create({
        title,
        content,
        excerpt,
        tags,
        author: req.user.id,
        status: status || 'draft',
        publishedAt: status === 'published' ? Date.now() : null,
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
   * Get all published articles (with pagination)
   */
  getAllArticles = async (req, res, next) => {
    try {
      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 10;
      const skip = (page - 1) * limit;

      const articles = await Article.find({ status: 'published' })
        .sort('-publishedAt')
        .skip(skip)
        .limit(limit)
        .populate('author', 'firstName lastName');

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
   * Get a single article by ID or slug
   */
  getArticle = async (req, res, next) => {
    try {
      let article;
      
      // Check if param is ObjectId or slug
      if (mongoose.isValidObjectId(req.params.id)) {
        article = await Article.findOne({
          $or: [
            { _id: req.params.id },
            { slug: req.params.id }
          ],
          status: 'published'
        }).populate('author', 'firstName lastName');
      } else {
        article = await Article.findOne({
          slug: req.params.id,
          status: 'published'
        }).populate('author', 'firstName lastName');
      }

      if (!article) {
        return next(new AppError('Article not found', 404));
      }

      // Increment view count
      article.viewCount += 1;
      await article.save();

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
   */
  updateArticle = async (req, res, next) => {
    try {
      const { title, content, excerpt, tags, status } = req.body;
      
      const article = await Article.findOneAndUpdate(
        { 
          _id: req.params.id,
          author: req.user.id 
        },
        {
          title,
          content,
          excerpt,
          tags,
          status,
          publishedAt: status === 'published' ? Date.now() : null
        },
        { 
          new: true,
          runValidators: true 
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
   * Delete an article (soft delete)
   */
  deleteArticle = async (req, res, next) => {
    try {
      const article = await Article.findOneAndUpdate(
        { 
          _id: req.params.id,
          author: req.user.id 
        },
        { status: 'archived' },
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
   * Get articles by author
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

export default new ArticleController();