import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { registerSchema } from '@/lib/validations';
import { successResponse, errorResponse, conflictResponse, serverErrorResponse } from '@/lib/apiResponse';
import { generateToken, generateRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    const { firstName, lastName, email, password, role } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return conflictResponse('User with this email already exists');
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
    });

    await newUser.save();

    // Generate tokens
    const token = generateToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = generateRefreshToken({
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    const response = successResponse(
      {
        user: {
          id: newUser._id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
        token,
        refreshToken,
      },
      'User registered successfully',
      201
    );

    return response;
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return serverErrorResponse('Failed to register user');
  }
}
