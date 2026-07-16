import mongoose, { Schema, Document } from 'mongoose';

interface IBlogCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IBlogComment extends Document {
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  content: string;
  status: 'approved' | 'pending' | 'rejected';
  likes: number;
  parentComment?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  tags: string[];
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  comments: mongoose.Types.ObjectId[];
  likes: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const categorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

const commentSchema = new Schema<IBlogComment>(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogPost', required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ['approved', 'pending', 'rejected'], default: 'pending' },
    likes: { type: Number, default: 0 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
  },
  { timestamps: true }
);

const postSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'BlogCategory', required: true },
    tags: [{ type: String }],
    featuredImage: { type: String },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    views: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlogComment' }],
    likes: { type: Number, default: 0 },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export const BlogCategory = mongoose.models.BlogCategory || mongoose.model<IBlogCategory>('BlogCategory', categorySchema);
export const BlogComment = mongoose.models.BlogComment || mongoose.model<IBlogComment>('BlogComment', commentSchema);
export const BlogPost = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', postSchema);
