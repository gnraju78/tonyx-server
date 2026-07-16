import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    if (auth.role !== 'admin') {
      return errorResponse('Only admins can access this', undefined, 403);
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return successResponse({
      users,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get users error:', error);
    return serverErrorResponse('Failed to fetch users');
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    if (auth.role !== 'admin') {
      return errorResponse('Only admins can perform this action', undefined, 403);
    }

    await connectDB();

    const { userId, status, role } = await req.json();

    if (!userId) {
      return errorResponse('userId is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse('User not found', undefined, 404);
    }

    if (status) user.status = status;
    if (role) user.role = role;

    await user.save();

    return successResponse(
      { id: user._id, status: user.status, role: user.role },
      'User updated successfully'
    );
  } catch (error) {
    console.error('[v0] Update user error:', error);
    return serverErrorResponse('Failed to update user');
  }
}
