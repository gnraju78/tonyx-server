import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Service } from '@/lib/models/Services';
import { authenticateRequest } from '@/lib/auth';
import { createServiceSchema } from '@/lib/validations';
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const photographerId = searchParams.get('photographerId');
    const category = searchParams.get('category');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const skip = parseInt(searchParams.get('skip') || '0');

    const filter: Record<string, any> = { isActive: true };
    if (photographerId) filter.photographer = photographerId;
    if (category) filter.category = category;

    const services = await Service.find(filter)
      .populate('photographer', 'firstName lastName profileImage')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Service.countDocuments(filter);

    return successResponse({
      services,
      pagination: { total, limit, skip },
    });
  } catch (error) {
    console.error('[v0] Get services error:', error);
    return serverErrorResponse('Failed to fetch services');
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
    const validation = createServiceSchema.safeParse(body);

    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) errors[path] = [];
        errors[path].push(err.message);
      });
      return errorResponse('Validation failed', errors);
    }

    const service = new Service({
      ...validation.data,
      photographer: auth.id,
    });

    await service.save();
    await service.populate('photographer', 'firstName lastName profileImage');

    return successResponse(service, 'Service created successfully', 201);
  } catch (error) {
    console.error('[v0] Create service error:', error);
    return serverErrorResponse('Failed to create service');
  }
}
