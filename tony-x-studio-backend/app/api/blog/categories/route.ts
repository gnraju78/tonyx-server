import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogCategory } from '@/lib/models/Blog';
import { authenticateRequest } from '@/lib/auth';
import { createBlogCategorySchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, conflictResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const categories = await BlogCategory.find().sort({ name: 1 });

    return successResponse({ categories });
  } catch (error) {
    console.error('[v0] Get categories error:', error);
    return serverErrorResponse('Failed to fetch categories');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if user is admin
    if (auth.role !== 'admin') {
      return errorResponse('Only admins can create categories', undefined, 403);
    }

    await connectDB();

    const body = await req.json();
    const validation = createBlogCategorySchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    // Check if category already exists
    const existingCategory = await BlogCategory.findOne({
      $or: [{ name: validation.data.name }, { slug: validation.data.slug }],
    });

    if (existingCategory) {
      return conflictResponse('Category with this name or slug already exists');
    }

    const category = new BlogCategory(validation.data);
    await category.save();

    return successResponse(category, 'Category created successfully', 201);
  } catch (error) {
    console.error('[v0] Create category error:', error);
    return serverErrorResponse('Failed to create category');
  }
}
