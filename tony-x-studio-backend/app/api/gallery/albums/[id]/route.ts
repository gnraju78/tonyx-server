import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Album } from '@/lib/models/Gallery';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const album = await Album.findById(id)
      .populate('photographer', 'firstName lastName profileImage')
      .populate('photos', 'title url thumbnail category');

    if (!album) {
      return notFoundResponse('Album not found');
    }

    return successResponse(album);
  } catch (error) {
    console.error('[v0] Get album error:', error);
    return serverErrorResponse('Failed to fetch album');
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

    const album = await Album.findById(id);
    if (!album) {
      return notFoundResponse('Album not found');
    }

    if (album.photographer.toString() !== auth.id) {
      return unauthorizedResponse('You can only update your own albums');
    }

    Object.assign(album, body);
    await album.save();

    return successResponse(album, 'Album updated successfully');
  } catch (error) {
    console.error('[v0] Update album error:', error);
    return serverErrorResponse('Failed to update album');
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

    const album = await Album.findById(id);
    if (!album) {
      return notFoundResponse('Album not found');
    }

    if (album.photographer.toString() !== auth.id) {
      return unauthorizedResponse('You can only delete your own albums');
    }

    await Album.findByIdAndDelete(id);

    return successResponse(null, 'Album deleted successfully');
  } catch (error) {
    console.error('[v0] Delete album error:', error);
    return serverErrorResponse('Failed to delete album');
  }
}
