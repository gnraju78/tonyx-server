import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { BlogComment, BlogPost } from '@/lib/models/Blog';
import { Review } from '@/lib/models/Services';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    if (auth.role !== 'admin') {
      return errorResponse('Only admins can access moderation', undefined, 403);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'comment', 'review', 'post'
    const status = searchParams.get('status') || 'pending';

    // Get pending comments
    let comments = [];
    if (!type || type === 'comment') {
      comments = await BlogComment.find({ status })
        .populate('author', 'firstName lastName email')
        .populate('post', 'title slug')
        .sort({ createdAt: -1 });
    }

    // Get pending reviews
    let reviews = [];
    if (!type || type === 'review') {
      reviews = await Review.find({ status })
        .populate('reviewer', 'firstName lastName email')
        .populate('photographer', 'firstName lastName')
        .sort({ createdAt: -1 });
    }

    // Get draft posts
    let posts = [];
    if (!type || type === 'post') {
      posts = await BlogPost.find({ status: 'draft' })
        .populate('author', 'firstName lastName email')
        .populate('category', 'name')
        .sort({ createdAt: -1 });
    }

    return successResponse({
      content: {
        comments,
        reviews,
        posts,
      },
      counts: {
        pendingComments: await BlogComment.countDocuments({ status: 'pending' }),
        pendingReviews: await Review.countDocuments({ status: 'pending' }),
        draftPosts: await BlogPost.countDocuments({ status: 'draft' }),
      },
    });
  } catch (error) {
    console.error('[v0] Moderation error:', error);
    return serverErrorResponse('Failed to fetch moderation queue');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    if (auth.role !== 'admin') {
      return errorResponse('Only admins can moderate content', undefined, 403);
    }

    await connectDB();

    const { contentType, contentId, action, rejectionReason } = await req.json();

    if (!contentType || !contentId || !action) {
      return errorResponse('Missing required fields');
    }

    // 'action' can be 'approve', 'reject', 'delete'
    let result;

    if (contentType === 'comment') {
      if (action === 'approve') {
        result = await BlogComment.findByIdAndUpdate(
          contentId,
          { status: 'approved' },
          { new: true }
        );
      } else if (action === 'reject') {
        result = await BlogComment.findByIdAndUpdate(
          contentId,
          { status: 'rejected' },
          { new: true }
        );
      } else if (action === 'delete') {
        result = await BlogComment.findByIdAndDelete(contentId);
      }
    } else if (contentType === 'review') {
      if (action === 'approve') {
        result = await Review.findByIdAndUpdate(
          contentId,
          { status: 'approved' },
          { new: true }
        );
      } else if (action === 'reject') {
        result = await Review.findByIdAndUpdate(
          contentId,
          { status: 'rejected' },
          { new: true }
        );
      } else if (action === 'delete') {
        result = await Review.findByIdAndDelete(contentId);
      }
    } else if (contentType === 'post') {
      if (action === 'approve') {
        result = await BlogPost.findByIdAndUpdate(
          contentId,
          { status: 'published', publishedAt: new Date() },
          { new: true }
        );
      } else if (action === 'reject') {
        result = await BlogPost.findByIdAndUpdate(
          contentId,
          { status: 'draft' },
          { new: true }
        );
      } else if (action === 'delete') {
        result = await BlogPost.findByIdAndDelete(contentId);
      }
    }

    if (!result) {
      return errorResponse(`${contentType} not found`, undefined, 404);
    }

    return successResponse(result, `Content ${action}ed successfully`);
  } catch (error) {
    console.error('[v0] Moderation action error:', error);
    return serverErrorResponse('Failed to perform moderation action');
  }
}
