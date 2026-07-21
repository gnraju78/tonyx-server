import { serviceRepository } from '../repositories/ServiceRepository.js';
import type { PaginatedResult } from '../repositories/BaseRepository.js';
import { NotFoundError } from '../utils/AppError.js';
import type { IService } from '../interfaces/service.interface.js';
import type { CreateServiceDto, UpdateServiceDto } from '../validators/service.validator.js';

export class ServiceService {
  async getAllServices(page?: number, limit?: number): Promise<PaginatedResult<IService>> {
    return serviceRepository.findAll({ page, limit, sort: { createdAt: -1 } });
  }

  async getServicesByCategory(
    category: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<IService>> {
    return serviceRepository.findByCategory(category, page, limit);
  }

  async getServiceById(serviceId: string): Promise<IService> {
    const service = await serviceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  async getPopularServices(limit: number): Promise<IService[]> {
    return serviceRepository.findPopular(limit);
  }

  async searchServices(
    term: string,
    category?: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedResult<IService>> {
    return serviceRepository.search(term, category, page, limit);
  }

  async createService(dto: CreateServiceDto): Promise<IService> {
    return serviceRepository.create(dto);
  }

  async updateService(serviceId: string, dto: UpdateServiceDto): Promise<IService> {
    const service = await serviceRepository.update(serviceId, dto);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
    return service;
  }

  async deleteService(serviceId: string): Promise<void> {
    const service = await serviceRepository.delete(serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }
  }
}

export const serviceService = new ServiceService();
