import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// .static for some functions

/**
 * BaseSchema
 * Common fields shared across all schemas for consistency.
 */
const BaseSchema = new mongoose.Schema({
  // Creation timestamp (set once)
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  // Last update timestamp (manually updated on save)
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Soft-delete flag or deactivation status
  isActive: {
    type: Boolean,
    default: true
  },
  // Arbitrary metadata for flexibility
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: false, // handled manually for full control
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware: update the `updatedAt` field on every save
BaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * UserSchema
 * Manages application users with authentication and role-based access.
 */
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // prevents password from being returned in queries
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['user', 'editor', 'admin'], // RBAC roles
    default: 'user'
  },
  lastLogin: Date, // Last login timestamp
  passwordChangedAt: Date, // Used for JWT invalidation
  passwordResetToken: String, // Token for password recovery
  passwordResetExpires: Date  // Expiration for the reset token
});

// Include common base fields
UserSchema.add(BaseSchema);

/**
 * Instance method: Generates JWT for the user
 * Includes user ID and role in the payload
 */
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long',
    { expiresIn: process.env.JWT_EXPIRES_IN || '100h' } 
  );
};
/**
 * Instance method: Validates user password
 * @param {string} candidatePassword - plaintext password
 * @returns {Promise<boolean>}
 */
UserSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance method: Checks if password was changed after token was issued
 * @param {number} JWTTimestamp - UNIX timestamp from token
 * @returns {boolean}
 */
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Hash password before saving if modified
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000; // buffer for token race condition
  next();
});

/**
 * ArticleSchema
 * Represents user-generated content with publishing states and metadata.
 */
const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true // for SEO-friendly URLs
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    maxlength: 200
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  tags: [{
    type: String,
    maxlength: 30
  }],
  featuredImage: String, // Optional image URL
  seoTitle: String,
  seoDescription: String,
  viewCount: {
    type: Number,
    default: 0
  }
});

// Include base fields
ArticleSchema.add(BaseSchema);

// Generate slug if not manually set
ArticleSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Virtual: populate article.comments
ArticleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article'
});

/**
 * CommentSchema
 * Comments on articles, with support for nesting (parentComment).
 */
const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment' // Optional for nested replies
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

// Include base fields
CommentSchema.add(BaseSchema);

/**
 * Indexes for performance optimization
 */
ArticleSchema.index({ title: 'text', content: 'text' });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ status: 1, publishedAt: 1 });
CommentSchema.index({ article: 1 });
CommentSchema.index({ user: 1 });

/**
 * Model exports
 */
const User = mongoose.model('User', UserSchema);
const Article = mongoose.model('Article', ArticleSchema);
const Comment = mongoose.model('Comment', CommentSchema);

export { User, Article, Comment };
