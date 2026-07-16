import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Notification } from '@/lib/models/Notification';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');
    const isRead = searchParams.get('isRead');

    const filter: Record<string, any> = { recipient: auth.id };
    if (isRead !== null) filter.isRead = isRead === 'true';

    const notifications = await Notification.find(filter)
      .populate('sender', 'firstName lastName profileImage')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      recipient: auth.id,
      isRead: false,
    });

    return successResponse({
      notifications,
      pagination: { total, limit, skip },
      unreadCount,
    });
  } catch (error) {
    console.error('[v0] Get notifications error:', error);
    return serverErrorResponse('Failed to fetch notifications');
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
    const { recipientId, type, title, message, data, actionUrl } = body;

    if (!recipientId || !type || !title || !message) {
      return errorResponse('Missing required fields');
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: auth.id,
      type,
      title,
      message,
      data,
      actionUrl,
    });

    await notification.save();
    await notification.populate('sender', 'firstName lastName profileImage');

    return successResponse(notification, 'Notification created successfully', 201);
  } catch (error) {
    console.error('[v0] Create notification error:', error);
    return serverErrorResponse('Failed to create notification');
  }
}
