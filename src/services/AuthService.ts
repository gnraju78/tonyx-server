import { userRepository } from '../repositories/UserRepository.js';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../utils/AppError.js';
import { signToken, verifyToken } from '../utils/jwt.js';
import { Role } from '../constants/roles.js';
import type { RegisterDto, LoginDto } from '../validators/auth.validator.js';
import type { IUser, PublicUser } from '../interfaces/user.interface.js';

export interface AuthResponse {
  readonly user: PublicUser;
  readonly token: string;
}

export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingEmail = await userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    const existingPhone = await userRepository.findByPhone(dto.phone);
    if (existingPhone) {
      throw new ConflictError('Phone number already registered');
    }

    const user = await userRepository.create({
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: Role.CUSTOMER,
      isActive: true,
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await userRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenError('User account is inactive');
    }

    await userRepository.updateLastLogin(user._id.toString());

    return this.buildAuthResponse(user);
  }

  async refreshToken(oldToken: string): Promise<AuthResponse> {
    const decoded = verifyToken(oldToken);
    const user = await userRepository.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: IUser): AuthResponse {
    const token = signToken(user._id);

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        role: user.role,
        bio: user.bio,
        specialization: user.specialization,
        rating: user.rating,
        isActive: user.isActive,
      },
      token,
    };
  }
}

export const authService = new AuthService();
