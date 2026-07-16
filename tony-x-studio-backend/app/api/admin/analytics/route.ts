import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { Photo } from '@/lib/models/Gallery';
import { Booking } from '@/lib/models/Booking';
import { BlogPost } from '@/lib/models/Blog';
import { Review } from '@/lib/models/Services';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, unauthorizedResponse, errorResponse, serverErrorResponse } from '@/lib/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    if (!auth) {
      return unauthorizedResponse('Authentication required');
    }

    // Check if user is admin
    if (auth.role !== 'admin') {
      return errorResponse('Only admins can access analytics', undefined, 403);
    }

    await connectDB();

    // Get analytics data
    const totalUsers = await User.countDocuments();
    const photographers = await User.countDocuments({ role: 'photographer' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const totalPhotos = await Photo.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    const totalPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    const draftPosts = await BlogPost.countDocuments({ status: 'draft' });

    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ status: 'approved' });

    // Calculate revenue (simple calculation based on completed bookings)
    const completedBookingsData = await Booking.find({ status: 'completed' });
    const totalRevenue = completedBookingsData.reduce((sum, b) => sum + (b.price || 0), 0);

    // Get recent activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find()
      .populate('client', 'firstName lastName')
      .populate('photographer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get top photographers by reviews
    const topPhotographers = await User.aggregate([
      { $match: { role: 'photographer' } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'photographer',
          as: 'reviews',
        },
      },
      { $addFields: { reviewCount: { $size: '$reviews' } } },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      { $project: { firstName: 1, lastName: 1, profileImage: 1, reviewCount: 1 } },
    ]);

    return successResponse({
      users: {
        total: totalUsers,
        photographers,
        regularUsers,
        suspended: suspendedUsers,
      },
      content: {
        photos: totalPhotos,
        posts: {
          total: totalPosts,
          published: publishedPosts,
          draft: draftPosts,
        },
        reviews: {
          total: totalReviews,
          approved: approvedReviews,
        },
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        completed: completedBookings,
        pending: pendingBookings,
        totalRevenue,
      },
      recent: {
        users: recentUsers,
        bookings: recentBookings,
        topPhotographers,
      },
    });
  } catch (error) {
    console.error('[v0] Analytics error:', error);
    return serverErrorResponse('Failed to fetch analytics');
  }
}
