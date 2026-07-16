import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking, PhotographySession } from '@/lib/models/Booking';
import { authenticateRequest } from '@/lib/auth';
import { createBookingSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = {
      $or: [{ client: auth.id }, { photographer: auth.id }],
    };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('client', 'firstName lastName email profileImage')
      .populate('photographer', 'firstName lastName profileImage')
      .populate('session', 'title duration basePrice')
      .limit(limit)
      .skip(skip)
      .sort({ scheduledDate: -1 });

    const total = await Booking.countDocuments(filter);

    return successResponse({
      bookings,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get bookings error:', error);
    return serverErrorResponse('Failed to fetch bookings');
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
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    // Check if session exists
    const session = await PhotographySession.findById(validation.data.sessionId);
    if (!session) {
      return notFoundResponse('Photography session not found');
    }

    // Check availability
    const availability = session.availability.find(
      (a: any) => a.date.toISOString().split('T')[0] === validation.data.scheduledDate.split('T')[0]
    );

    if (!availability || !availability.isAvailable) {
      return errorResponse('Selected date/time is not available');
    }

    // Create booking
    const booking = new Booking({
      client: auth.id,
      photographer: session.photographer,
      session: validation.data.sessionId,
      scheduledDate: validation.data.scheduledDate,
      scheduledTime: validation.data.scheduledTime,
      duration: session.duration,
      price: session.basePrice,
      notes: validation.data.notes,
      location: validation.data.location,
    });

    await booking.save();
    await booking.populate('client', 'firstName lastName email');
    await booking.populate('photographer', 'firstName lastName');

    return successResponse(booking, 'Booking created successfully', 201);
  } catch (error) {
    console.error('[v0] Create booking error:', error);
    return serverErrorResponse('Failed to create booking');
  }
}
