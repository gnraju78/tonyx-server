import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Booking } from '@/lib/models/Booking';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, notFoundResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(
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

    const booking = await Booking.findById(id)
      .populate('client', 'firstName lastName email profileImage')
      .populate('photographer', 'firstName lastName profileImage')
      .populate('session', 'title duration basePrice');

    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Check authorization
    if (
      booking.client.toString() !== auth.id &&
      booking.photographer.toString() !== auth.id
    ) {
      return unauthorizedResponse('You cannot view this booking');
    }

    return successResponse(booking);
  } catch (error) {
    console.error('[v0] Get booking error:', error);
    return serverErrorResponse('Failed to fetch booking');
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

    const booking = await Booking.findById(id);
    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    // Only photographer can update status, client can update notes/location
    if (booking.photographer.toString() === auth.id && body.status) {
      booking.status = body.status;
    } else if (booking.client.toString() === auth.id) {
      if (body.notes) booking.notes = body.notes;
      if (body.location) booking.location = body.location;
    } else {
      return unauthorizedResponse('You cannot update this booking');
    }

    await booking.save();

    return successResponse(booking, 'Booking updated successfully');
  } catch (error) {
    console.error('[v0] Update booking error:', error);
    return serverErrorResponse('Failed to update booking');
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

    const booking = await Booking.findById(id);
    if (!booking) {
      return notFoundResponse('Booking not found');
    }

    if (booking.client.toString() !== auth.id) {
      return unauthorizedResponse('Only the client can cancel a booking');
    }

    if (booking.status === 'completed') {
      return errorResponse('Cannot cancel a completed booking');
    }

    booking.status = 'cancelled';
    await booking.save();

    return successResponse(booking, 'Booking cancelled successfully');
  } catch (error) {
    console.error('[v0] Cancel booking error:', error);
    return serverErrorResponse('Failed to cancel booking');
  }
}
