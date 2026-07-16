import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogComment, BlogPost } from '@/lib/models/Blog';
import { authenticateRequest } from '@/lib/auth';
import { createCommentSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const status = searchParams.get('status') || 'approved';

    if (!postId) {
      return errorResponse('postId query parameter is required');
    }

    const comments = await BlogComment.find({
      post: postId,
      status,
      parentComment: { $exists: false },
    })
      .populate('author', 'firstName lastName profileImage')
      .populate({
        path: 'replies',
        populate: { path: 'author', select: 'firstName lastName profileImage' },
      })
      .sort({ createdAt: -1 });

    return successResponse({ comments });
  } catch (error) {
    console.error('[v0] Get comments error:', error);
    return serverErrorResponse('Failed to fetch comments');
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return errorResponse('postId query parameter is required');
    }

    // Check if post exists
    const post = await BlogPost.findById(postId);
    if (!post) {
      return notFoundResponse('Blog post not found');
    }

    const body = await req.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    const comment = new BlogComment({
      author: auth.id,
      post: postId,
      content: validation.data.content,
      parentComment: validation.data.parentCommentId,
    });

    await comment.save();
    await comment.populate('author', 'firstName lastName profileImage');

    // If parent comment, add to replies
    if (validation.data.parentCommentId) {
      await BlogComment.findByIdAndUpdate(
        validation.data.parentCommentId,
        { $push: { replies: comment._id } }
      );
    } else {
      // Add to post comments
      await BlogPost.findByIdAndUpdate(postId, { $push: { comments: comment._id } });
    }

    return successResponse(comment, 'Comment created successfully', 201);
  } catch (error) {
    console.error('[v0] Create comment error:', error);
    return serverErrorResponse('Failed to create comment');
  }
}
