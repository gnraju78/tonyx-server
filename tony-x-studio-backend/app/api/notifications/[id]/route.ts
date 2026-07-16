import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/lib/models/Notification';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function PATCH(
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

    const notification = await Notification.findById(id);
    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    if (notification.recipient.toString() !== auth.id) {
      return unauthorizedResponse('You can only update your own notifications');
    }

    if (body.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
    }

    await notification.save();

    return successResponse(notification, 'Notification updated successfully');
  } catch (error) {
    console.error('[v0] Update notification error:', error);
    return serverErrorResponse('Failed to update notification');
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

    const notification = await Notification.findById(id);
    if (!notification) {
      return notFoundResponse('Notification not found');
    }

    if (notification.recipient.toString() !== auth.id) {
      return unauthorizedResponse('You can only delete your own notifications');
    }

    await Notification.findByIdAndDelete(id);

    return successResponse(null, 'Notification deleted successfully');
  } catch (error) {
    console.error('[v0] Delete notification error:', error);
    return serverErrorResponse('Failed to delete notification');
  }
}
