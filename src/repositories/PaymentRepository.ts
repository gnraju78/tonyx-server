import type { FilterQuery } from 'mongoose';
import { BaseRepository, type PaginatedResult } from './BaseRepository.js';
import { Payment } from '../models/Payment.js';
import type { IPayment, RefundDetails } from '../interfaces/payment.interface.js';
import { PaymentStatus } from '../interfaces/payment.interface.js';

interface EarningsSummary {
  readonly _id: null;
  readonly totalEarnings: number;
  readonly transactionCount: number;
  readonly averageTransaction: number;
}

interface DailyEarnings {
  readonly _id: string;
  readonly dailyEarnings: number;
  readonly transactionCount: number;
}

export class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(Payment);
  }

  async findByPayer(
    payerId: string,
    page?: number,
    limit?: number,
    status?: string
  ): Promise<PaginatedResult<IPayment>> {
    const filter: FilterQuery<IPayment> = { payer: payerId };
    if (status) filter.status = status;

    return this.findAll({ filter, page, limit, sort: { createdAt: -1 } });
  }

  async findByPayee(
    payeeId: string,
    page?: number,
    limit?: number,
    status?: string
  ): Promise<PaginatedResult<IPayment>> {
    const filter: FilterQuery<IPayment> = { payee: payeeId };
    if (status) filter.status = status;

    return this.findAll({ filter, page, limit, sort: { createdAt: -1 } });
  }

  async findByBooking(bookingId: string): Promise<IPayment | null> {
    return Payment.findOne({ booking: bookingId, deletedAt: null })
      .populate('payer', 'firstName lastName email')
      .populate('payee', 'firstName lastName email');
  }

  async updateStatus(paymentId: string, status: IPayment['status']): Promise<IPayment | null> {
    return this.update(paymentId, { status });
  }

  async addRefund(paymentId: string, refundData: RefundDetails): Promise<IPayment | null> {
    return this.update(paymentId, { status: PaymentStatus.REFUNDED, refundDetails: refundData });
  }

  async getEarningsStats(
    payeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<EarningsSummary[]> {
    return Payment.aggregate<EarningsSummary>([
      {
        $match: {
          payee: payeeId,
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: startDate, $lte: endDate },
          deletedAt: null,
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

  async getDailyEarnings(
    payeeId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyEarnings[]> {
    return Payment.aggregate<DailyEarnings>([
      {
        $match: {
          payee: payeeId,
          status: PaymentStatus.COMPLETED,
          createdAt: { $gte: startDate, $lte: endDate },
          deletedAt: null,
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

export const paymentRepository = new PaymentRepository();
