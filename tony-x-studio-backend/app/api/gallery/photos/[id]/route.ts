import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Photo } from '@/lib/models/Gallery';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const photo = await Photo.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('photographer', 'firstName lastName profileImage');

    if (!photo) {
      return notFoundResponse('Photo not found');
    }

    return successResponse(photo);
  } catch (error) {
    console.error('[v0] Get photo error:', error);
    return serverErrorResponse('Failed to fetch photo');
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

    const photo = await Photo.findById(id);
    if (!photo) {
      return notFoundResponse('Photo not found');
    }

    if (photo.photographer.toString() !== auth.id) {
      return unauthorizedResponse('You can only update your own photos');
    }

    Object.assign(photo, body);
    await photo.save();

    return successResponse(photo, 'Photo updated successfully');
  } catch (error) {
    console.error('[v0] Update photo error:', error);
    return serverErrorResponse('Failed to update photo');
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

    const photo = await Photo.findById(id);
    if (!photo) {
      return notFoundResponse('Photo not found');
    }

    if (photo.photographer.toString() !== auth.id) {
      return unauthorizedResponse('You can only delete your own photos');
    }

    await Photo.findByIdAndDelete(id);

    return successResponse(null, 'Photo deleted successfully');
  } catch (error) {
    console.error('[v0] Delete photo error:', error);
    return serverErrorResponse('Failed to delete photo');
  }
}
