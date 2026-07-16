import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogPost } from '@/lib/models/Blog';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'firstName lastName profileImage')
      .populate('category', 'name slug')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'firstName lastName profileImage' },
      });

    if (!post) {
      return notFoundResponse('Blog post not found');
    }

    return successResponse(post);
  } catch (error) {
    console.error('[v0] Get post error:', error);
    return serverErrorResponse('Failed to fetch blog post');
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const post = await BlogPost.findById(id);
    if (!post) {
      return notFoundResponse('Blog post not found');
    }

    if (post.author.toString() !== auth.id && auth.role !== 'admin') {
      return unauthorizedResponse('You can only update your own posts');
    }

    if (body.status === 'published' && post.status !== 'published') {
      body.publishedAt = new Date();
    }

    Object.assign(post, body);
    await post.save();

    return successResponse(post, 'Blog post updated successfully');
  } catch (error) {
    console.error('[v0] Update post error:', error);
    return serverErrorResponse('Failed to update blog post');
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const { id } = await params;

    const post = await BlogPost.findById(id);
    if (!post) {
      return notFoundResponse('Blog post not found');
    }

    if (post.author.toString() !== auth.id && auth.role !== 'admin') {
      return unauthorizedResponse('You can only delete your own posts');
    }

    await BlogPost.findByIdAndDelete(id);

    return successResponse(null, 'Blog post deleted successfully');
  } catch (error) {
    console.error('[v0] Delete post error:', error);
    return serverErrorResponse('Failed to delete blog post');
  }
}
