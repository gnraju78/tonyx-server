import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RegisterDto, LoginDto } from '../../src/validators/auth.validator.js';
import type { IUser } from '../../src/interfaces/user.interface.js';

const mockUserRepository = {
  findByEmail: vi.fn(),
  findByPhone: vi.fn(),
  create: vi.fn(),
  findByEmailWithPassword: vi.fn(),
  updateLastLogin: vi.fn(),
  findById: vi.fn(),
};

vi.mock('../../src/repositories/UserRepository.js', () => ({
  userRepository: mockUserRepository,
}));

const { AuthService } = await import('../../src/services/AuthService.js');
const { ConflictError, UnauthorizedError, ForbiddenError } =
  await import('../../src/utils/AppError.js');

function buildUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: 'user-1' as unknown as IUser['_id'],
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+11234567890',
    password: 'hashed',
    role: 'customer',
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

const registerDto: RegisterDto = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '+11234567890',
  password: 'secret123',
};

const loginDto: LoginDto = { email: 'jane@example.com', password: 'secret123' };

describe('AuthService', () => {
  const authService = new AuthService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('rejects registration when the email is already taken', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(buildUser());

      await expect(authService.register(registerDto)).rejects.toBeInstanceOf(ConflictError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('rejects registration when the phone is already taken', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(buildUser());

      await expect(authService.register(registerDto)).rejects.toBeInstanceOf(ConflictError);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('creates the user and returns a signed token when email/phone are free', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.findByPhone.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(buildUser());

      const result = await authService.register(registerDto);

      expect(result.user.email).toBe('jane@example.com');
      expect(typeof result.token).toBe('string');
      expect(result.token.split('.')).toHaveLength(3);
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('rejects an incorrect password', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        ...buildUser(),
        comparePassword: vi.fn().mockResolvedValue(false),
      });

      await expect(authService.login(loginDto)).rejects.toBeInstanceOf(UnauthorizedError);
    });

    it('rejects a correct password on a deactivated account', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        ...buildUser({ isActive: false }),
        comparePassword: vi.fn().mockResolvedValue(true),
      });

      await expect(authService.login(loginDto)).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('returns a token and updates last login on success', async () => {
      mockUserRepository.findByEmailWithPassword.mockResolvedValue({
        ...buildUser(),
        comparePassword: vi.fn().mockResolvedValue(true),
      });

      const result = await authService.login(loginDto);

      expect(result.user.email).toBe('jane@example.com');
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledTimes(1);
    });
  });
});
