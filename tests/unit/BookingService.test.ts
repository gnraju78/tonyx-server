import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CreateBookingDto } from '../../src/validators/booking.validator.js';
import type { IBooking } from '../../src/interfaces/booking.interface.js';
import type { IService } from '../../src/interfaces/service.interface.js';
import type { IUser } from '../../src/interfaces/user.interface.js';

const mockBookingRepository = {
  findConflictingBookings: vi.fn(),
  create: vi.fn(),
  findByIdPopulated: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  updateStatus: vi.fn(),
};

const mockUserRepository = {
  findById: vi.fn(),
};

const mockServiceRepository = {
  findById: vi.fn(),
  incrementBookingCount: vi.fn(),
};

vi.mock('../../src/repositories/BookingRepository.js', () => ({
  bookingRepository: mockBookingRepository,
}));
vi.mock('../../src/repositories/UserRepository.js', () => ({
  userRepository: mockUserRepository,
}));
vi.mock('../../src/repositories/ServiceRepository.js', () => ({
  serviceRepository: mockServiceRepository,
}));

const { BookingService } = await import('../../src/services/BookingService.js');
const { BadRequestError, ConflictError, ForbiddenError, NotFoundError } =
  await import('../../src/utils/AppError.js');

function id(value: string): IUser['_id'] {
  return value as unknown as IUser['_id'];
}

function buildBarber(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: id('barber-1'),
    firstName: 'Bob',
    lastName: 'Barber',
    email: 'bob@example.com',
    phone: '+11234567890',
    password: 'hashed',
    role: 'barber',
    isActive: true,
    specialization: [],
    rating: { average: 0, count: 0 },
    availability: new Map(),
    totalEarnings: 0,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

function buildService(overrides: Partial<IService> = {}): IService {
  return {
    _id: id('service-1'),
    name: 'Haircut',
    description: 'A basic haircut service description.',
    category: 'haircut',
    basePrice: 30,
    duration: 30,
    isActive: true,
    barberSpecialists: [],
    discountPercentage: 0,
    requirements: { minSeniorityLevel: 'beginner', tools: [], products: [] },
    popularity: { bookingCount: 0, averageRating: 0 },
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

const createDto: CreateBookingDto = {
  barberId: 'barber-1',
  serviceIds: ['service-1'],
  scheduledDate: new Date('2026-08-01'),
  startTime: '10:00',
  endTime: '10:30',
};

describe('BookingService.createBooking', () => {
  const bookingService = new BookingService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws NotFoundError when the barber does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(bookingService.createBooking('customer-1', createDto)).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it('throws BadRequestError when the target user is not a barber', async () => {
    mockUserRepository.findById.mockResolvedValue(buildBarber({ role: 'customer' }));

    await expect(bookingService.createBooking('customer-1', createDto)).rejects.toBeInstanceOf(
      BadRequestError
    );
  });

  it('throws ConflictError when the slot is already booked', async () => {
    mockUserRepository.findById.mockResolvedValue(buildBarber());
    mockBookingRepository.findConflictingBookings.mockResolvedValue([
      { _id: 'existing' } as unknown as IBooking,
    ]);

    await expect(bookingService.createBooking('customer-1', createDto)).rejects.toBeInstanceOf(
      ConflictError
    );
    expect(mockBookingRepository.create).not.toHaveBeenCalled();
  });

  it('throws NotFoundError when a requested service does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(buildBarber());
    mockBookingRepository.findConflictingBookings.mockResolvedValue([]);
    mockServiceRepository.findById.mockResolvedValue(null);

    await expect(bookingService.createBooking('customer-1', createDto)).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it('computes totalPrice/totalDuration and increments each service booking count', async () => {
    mockUserRepository.findById.mockResolvedValue(buildBarber());
    mockBookingRepository.findConflictingBookings.mockResolvedValue([]);
    mockServiceRepository.findById.mockResolvedValue(buildService());
    mockBookingRepository.create.mockResolvedValue({ _id: id('booking-1') } as unknown as IBooking);
    mockBookingRepository.findByIdPopulated.mockResolvedValue({
      _id: id('booking-1'),
    } as unknown as IBooking);

    await bookingService.createBooking('customer-1', createDto);

    expect(mockBookingRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ totalPrice: 30, totalDuration: 30, status: 'pending' })
    );
    expect(mockServiceRepository.incrementBookingCount).toHaveBeenCalledTimes(1);
  });
});

describe('BookingService.cancelBooking', () => {
  const bookingService = new BookingService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function buildBooking(overrides: Partial<IBooking> = {}): IBooking {
    return {
      _id: id('booking-1'),
      bookingNumber: 'BK-1',
      customer: id('customer-1'),
      barber: id('barber-1'),
      services: [],
      scheduledDate: new Date(),
      startTime: '10:00',
      endTime: '10:30',
      totalDuration: 30,
      totalPrice: 30,
      status: 'pending',
      payment: { status: 'pending' },
      location: 'Main Studio',
      reminderSent: false,
      rescheduleCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    } as IBooking;
  }

  it('forbids cancellation by a non-participant', async () => {
    mockBookingRepository.findById.mockResolvedValue(buildBooking());

    await expect(
      bookingService.cancelBooking('booking-1', 'someone-else', 'changed my mind')
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it('rejects cancelling an already-cancelled booking', async () => {
    mockBookingRepository.findById.mockResolvedValue(buildBooking({ status: 'cancelled' }));

    await expect(
      bookingService.cancelBooking('booking-1', 'customer-1', 'reason')
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('cancels a pending booking owned by the customer', async () => {
    mockBookingRepository.findById.mockResolvedValue(buildBooking());
    mockBookingRepository.update.mockResolvedValue(buildBooking({ status: 'cancelled' }));

    const result = await bookingService.cancelBooking('booking-1', 'customer-1', 'reason');

    expect(result.status).toBe('cancelled');
  });
});
