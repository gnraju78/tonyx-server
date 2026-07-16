import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Review, Rating } from '@/lib/models/Services';
import { authenticateRequest } from '@/lib/auth';
import { createReviewSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const photographerId = searchParams.get('photographerId');
    const status = searchParams.get('status') || 'approved';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    if (!photographerId) {
      return errorResponse('photographerId query parameter is required');
    }

    const reviews = await Review.find({
      photographer: photographerId,
      status,
    })
      .populate('reviewer', 'firstName lastName profileImage')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({
      photographer: photographerId,
      status,
    });

    return successResponse({
      reviews,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get reviews error:', error);
    return serverErrorResponse('Failed to fetch reviews');
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
    const photographerId = searchParams.get('photographerId');

    if (!photographerId) {
      return errorResponse('photographerId query parameter is required');
    }

    const body = await req.json();
    const validation = createReviewSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    // Check if user already reviewed this photographer
    const existingReview = await Review.findOne({
      reviewer: auth.id,
      photographer: photographerId,
    });

    if (existingReview) {
      return errorResponse('You have already reviewed this photographer');
    }

    const review = new Review({
      reviewer: auth.id,
      photographer: photographerId,
      ...validation.data,
    });

    await review.save();
    await review.populate('reviewer', 'firstName lastName profileImage');

    // Update rating
    const allReviews = await Review.find({
      photographer: photographerId,
      status: 'approved',
    });

    const averageRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    const ratingDistribution = {
      5: allReviews.filter((r) => r.rating === 5).length,
      4: allReviews.filter((r) => r.rating === 4).length,
      3: allReviews.filter((r) => r.rating === 3).length,
      2: allReviews.filter((r) => r.rating === 2).length,
      1: allReviews.filter((r) => r.rating === 1).length,
    };

    await Rating.findOneAndUpdate(
      { photographer: photographerId },
      {
        photographer: photographerId,
        averageRating,
        totalReviews: allReviews.length,
        ratingDistribution,
      },
      { upsert: true }
    );

    return successResponse(review, 'Review created successfully', 201);
  } catch (error) {
    console.error('[v0] Create review error:', error);
    return serverErrorResponse('Failed to create review');
  }
}
