import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { authenticateRequest } from '@/lib/auth';
import { updateProfileSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const user = await User.findById(auth.id);
    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      socialLinks: user.socialLinks,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('[v0] Get profile error:', error);
    return serverErrorResponse('Failed to fetch profile');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const body = await req.json();
    const validation = updateProfileSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    const user = await User.findByIdAndUpdate(
      auth.id,
      validation.data,
      { new: true, runValidators: true }
    );

    if (!user) {
      return notFoundResponse('User not found');
    }

    return successResponse(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        bio: user.bio,
        socialLinks: user.socialLinks,
        preferences: user.preferences,
      },
      'Profile updated successfully'
    );
  } catch (error) {
    console.error('[v0] Update profile error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}
