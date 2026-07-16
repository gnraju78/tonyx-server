import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Photo, Album } from '@/lib/models/Gallery';
import { authenticateRequest } from '@/lib/auth';
import { createPhotoSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const albumId = searchParams.get('albumId');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = {};
    if (albumId) filter.album = albumId;
    if (category) filter.category = category;

    const photos = await Photo.find(filter)
      .populate('photographer', 'firstName lastName profileImage')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Photo.countDocuments(filter);

    return successResponse({
      photos,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get photos error:', error);
    return serverErrorResponse('Failed to fetch photos');
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
    const validation = createPhotoSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    // Check if album belongs to photographer
    if (validation.data.albumId) {
      const album = await Album.findById(validation.data.albumId);
      if (!album || album.photographer.toString() !== auth.id) {
        return unauthorizedResponse('You cannot add photos to this album');
      }
    }

    const photo = new Photo({
      ...validation.data,
      photographer: auth.id,
    });

    await photo.save();
    await photo.populate('photographer', 'firstName lastName profileImage');

    return successResponse(photo, 'Photo created successfully', 201);
  } catch (error) {
    console.error('[v0] Create photo error:', error);
    return serverErrorResponse('Failed to create photo');
  }
}
