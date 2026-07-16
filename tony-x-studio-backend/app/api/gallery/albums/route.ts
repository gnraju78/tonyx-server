import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Album } from '@/lib/models/Gallery';
import { authenticateRequest } from '@/lib/auth';
import { createAlbumSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const photographerId = searchParams.get('photographerId');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = { isPublic: true };
    if (photographerId) filter.photographer = photographerId;

    const albums = await Album.find(filter)
      .populate('photographer', 'firstName lastName profileImage')
      .populate('photos', 'title url thumbnail')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Album.countDocuments(filter);

    return successResponse({
      albums,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get albums error:', error);
    return serverErrorResponse('Failed to fetch albums');
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
    const validation = createAlbumSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    const album = new Album({
      ...validation.data,
      photographer: auth.id,
    });

    await album.save();
    await album.populate('photographer', 'firstName lastName profileImage');

    return successResponse(album, 'Album created successfully', 201);
  } catch (error) {
    console.error('[v0] Create album error:', error);
    return serverErrorResponse('Failed to create album');
  }
}
