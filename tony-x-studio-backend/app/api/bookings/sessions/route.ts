import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { PhotographySession } from '@/lib/models/Booking';
import { authenticateRequest } from '@/lib/auth';
import { createSessionSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const photographerId = searchParams.get('photographerId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = {};
    if (photographerId) filter.photographer = photographerId;

    const sessions = await PhotographySession.find(filter)
      .populate('photographer', 'firstName lastName profileImage')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await PhotographySession.countDocuments(filter);

    return successResponse({
      sessions,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get sessions error:', error);
    return serverErrorResponse('Failed to fetch sessions');
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
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    const session = new PhotographySession({
      ...validation.data,
      photographer: auth.id,
      availability: [],
    });

    await session.save();
    await session.populate('photographer', 'firstName lastName profileImage');

    return successResponse(session, 'Photography session created successfully', 201);
  } catch (error) {
    console.error('[v0] Create session error:', error);
    return serverErrorResponse('Failed to create photography session');
  }
}
