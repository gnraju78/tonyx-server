import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginatedSuccess, sendSuccess } from '../utils/response.js';
import { userService } from '../services/UserService.js';
import { UnauthorizedError } from '../utils/AppError.js';
import { getValidatedQuery, type TypedRequest } from '../interfaces/http.interface.js';
import type { PaginationQueryDto } from '../validators/common.validator.js';
import type {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateAvailabilityDto,
  SearchBarbersQueryDto,
} from '../validators/user.validator.js';

function requireUserId(req: { user?: { id: { toString(): string } } }): string {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }
  return req.user.id.toString();
}

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(requireUserId(req));
  sendSuccess(res, user, 'Profile retrieved successfully');
});

export const updateProfile = asyncHandler<TypedRequest<UpdateProfileDto>>(async (req, res) => {
  const user = await userService.updateProfile(requireUserId(req), req.body);
  sendSuccess(res, user, 'Profile updated successfully');
});

export const getBarbers = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<PaginationQueryDto>(req);
  const result = await userService.getBarbers(query.page, query.limit);
  sendPaginatedSuccess(res, result.data, result, 'Barbers retrieved successfully');
});

export const searchBarbers = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<SearchBarbersQueryDto>(req);
  const result = await userService.searchBarbers(query);
  sendPaginatedSuccess(res, result.data, result, 'Barbers found');
});

export const getBarberById = asyncHandler<TypedRequest<unknown, { id: string }>>(
  async (req, res) => {
    const barber = await userService.getBarberById(req.params.id);
    sendSuccess(res, barber, 'Barber retrieved successfully');
  }
);

export const changePassword = asyncHandler<TypedRequest<ChangePasswordDto>>(async (req, res) => {
  await userService.changePassword(requireUserId(req), req.body);
  sendSuccess(res, null, 'Password changed successfully');
});

export const updateAvailability = asyncHandler<TypedRequest<UpdateAvailabilityDto>>(
  async (req, res) => {
    const user = await userService.updateAvailability(requireUserId(req), req.body);
    sendSuccess(res, user, 'Availability updated successfully');
  }
);

export const deactivateAccount = asyncHandler(async (req, res) => {
  await userService.deactivateAccount(requireUserId(req));
  sendSuccess(res, null, 'Account deactivated successfully');
});
