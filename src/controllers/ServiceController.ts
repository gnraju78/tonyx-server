import { asyncHandler } from '../utils/asyncHandler.js';
import { sendPaginatedSuccess, sendSuccess } from '../utils/response.js';
import { HttpStatus } from '../constants/httpStatus.js';
import { serviceService } from '../services/ServiceService.js';
import { getValidatedQuery, type TypedRequest } from '../interfaces/http.interface.js';
import type {
  CreateServiceDto,
  UpdateServiceDto,
  SearchServiceQueryDto,
  PopularServicesQueryDto,
} from '../validators/service.validator.js';
import type { PaginationQueryDto } from '../validators/common.validator.js';

export const getAllServices = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<PaginationQueryDto>(req);
  const result = await serviceService.getAllServices(query.page, query.limit);
  sendPaginatedSuccess(res, result.data, result, 'Services retrieved');
});

export const getServicesByCategory = asyncHandler<TypedRequest<unknown, { category: string }>>(
  async (req, res) => {
    const query = getValidatedQuery<PaginationQueryDto>(req);
    const result = await serviceService.getServicesByCategory(
      req.params.category,
      query.page,
      query.limit
    );
    sendPaginatedSuccess(res, result.data, result, 'Services retrieved');
  }
);

export const getServiceById = asyncHandler<TypedRequest<unknown, { id: string }>>(
  async (req, res) => {
    const service = await serviceService.getServiceById(req.params.id);
    sendSuccess(res, service, 'Service retrieved');
  }
);

export const getPopularServices = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<PopularServicesQueryDto>(req);
  const services = await serviceService.getPopularServices(query.limit ?? 10);
  sendSuccess(res, services, 'Popular services retrieved');
});

export const searchServices = asyncHandler(async (req, res) => {
  const query = getValidatedQuery<SearchServiceQueryDto>(req);
  const result = await serviceService.searchServices(
    query.term,
    query.category,
    query.page,
    query.limit
  );
  sendPaginatedSuccess(res, result.data, result, 'Services found');
});

export const createService = asyncHandler<TypedRequest<CreateServiceDto>>(async (req, res) => {
  const service = await serviceService.createService(req.body);
  sendSuccess(res, service, 'Service created successfully', HttpStatus.CREATED);
});

export const updateService = asyncHandler<TypedRequest<UpdateServiceDto, { id: string }>>(
  async (req, res) => {
    const service = await serviceService.updateService(req.params.id, req.body);
    sendSuccess(res, service, 'Service updated successfully');
  }
);

export const deleteService = asyncHandler<TypedRequest<unknown, { id: string }>>(
  async (req, res) => {
    await serviceService.deleteService(req.params.id);
    sendSuccess(res, null, 'Service deleted successfully');
  }
);
