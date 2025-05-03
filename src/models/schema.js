import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Base schema with common fields and methods
const BaseSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: false, // We're handling them manually
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware for base schema
BaseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// User Schema
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
    select: false
  },
  Name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastLogin: Date,
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

// Add base schema to UserSchema
UserSchema.add(BaseSchema);

// User methods
UserSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

UserSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Article Schema
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
    lowercase: true
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
  featuredImage: String,
  seoTitle: String,
  seoDescription: String,
  viewCount: {
    type: Number,
    default: 0
  }
});

// Add base schema to ArticleSchema
ArticleSchema.add(BaseSchema);

// Article methods
ArticleSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

ArticleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article'
});

// Comment Schema
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
    ref: 'Comment'
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

// Add base schema to CommentSchema
CommentSchema.add(BaseSchema);

// Indexes
// UserSchema.index({ email: 1 });
ArticleSchema.index({ title: 'text', content: 'text' });
// ArticleSchema.index({ slug: 1 });
ArticleSchema.index({ author: 1 });
ArticleSchema.index({ status: 1, publishedAt: 1 });
CommentSchema.index({ article: 1 });
CommentSchema.index({ user: 1 });

// Models
const User = mongoose.model('User', UserSchema);
const Article = mongoose.model('Article', ArticleSchema);
const Comment = mongoose.model('Comment', CommentSchema);

export { User, Article, Comment };