import { BaseRepository } from './BaseRepository.js';
import Payment from '../models/Payment.js';

export class PaymentRepository extends BaseRepository {
  constructor() {
    super(Payment);
  }

  async findByPayer(payerId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    let filter = { payer: payerId };
    if (status) filter.status = status;

    const payments = await this.model
      .find(filter)
      .populate('booking', 'bookingNumber totalPrice')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.model.countDocuments(filter);

    return { data: payments, total, page, limit };
  }

  async findByPayee(payeeId, query = {}) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    let filter = { payee: payeeId };
    if (status) filter.status = status;

    const payments = await this.model
      .find(filter)
      .populate('booking', 'bookingNumber')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.model.countDocuments(filter);

    return { data: payments, total, page, limit };
  }

  async findByBooking(bookingId) {
    return await this.model
      .findOne({ booking: bookingId })
      .populate('payer', 'firstName lastName email')
      .populate('payee', 'firstName lastName email');
  }

  async updateStatus(paymentId, status) {
    return await this.model.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );
  }

  async addRefund(paymentId, refundData) {
    return await this.model.findByIdAndUpdate(
      paymentId,
      {
        status: 'refunded',
        refundDetails: refundData,
      },
      { new: true }
    );
  }

  async getEarningsStats(payeeId, startDate, endDate) {
    return await this.model.aggregate([
      {
        $match: {
          payee: payeeId,
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
          averageTransaction: { $avg: '$amount' },
        },
      },
    ]);
  }

  async getDailyEarnings(payeeId, startDate, endDate) {
    return await this.model.aggregate([
      {
        $match: {
          payee: payeeId,
          status: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          dailyEarnings: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}

export default new PaymentRepository();
