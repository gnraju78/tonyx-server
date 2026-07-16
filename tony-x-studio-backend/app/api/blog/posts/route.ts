import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogPost, BlogCategory } from '@/lib/models/Blog';
import { authenticateRequest } from '@/lib/auth';
import { createBlogPostSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'published';
    const categoryId = searchParams.get('categoryId');
    const tag = searchParams.get('tag');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = { status };
    if (categoryId) filter.category = categoryId;
    if (tag) filter.tags = tag;

    const posts = await BlogPost.find(filter)
      .populate('author', 'firstName lastName profileImage')
      .populate('category', 'name slug')
      .limit(limit)
      .skip(skip)
      .sort({ publishedAt: -1 });

    const total = await BlogPost.countDocuments(filter);

    return successResponse({
      posts,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get posts error:', error);
    return serverErrorResponse('Failed to fetch blog posts');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const body = await req.json();
    const validation = createBlogPostSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    // Check if category exists
    const category = await BlogCategory.findById(validation.data.categoryId);
    if (!category) {
      return notFoundResponse('Category not found');
    }

    // Check if slug is unique
    const existingPost = await BlogPost.findOne({ slug: validation.data.slug });
    if (existingPost) {
      return errorResponse('A post with this slug already exists');
    }

    const post = new BlogPost({
      ...validation.data,
      author: auth.id,
      publishedAt: validation.data.status === 'published' ? new Date() : null,
    });

    await post.save();
    await post.populate('author', 'firstName lastName profileImage');
    await post.populate('category', 'name slug');

    return successResponse(post, 'Blog post created successfully', 201);
  } catch (error) {
    console.error('[v0] Create post error:', error);
    return serverErrorResponse('Failed to create blog post');
  }
}
