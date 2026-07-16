import { sendSuccess, sendPaginatedSuccess } from '../utils/response.js';
import serviceRepository from '../repositories/ServiceRepository.js';

export class ServiceController {
  async getAllServices(req, res, next) {
    try {
      const result = await serviceRepository.findAll(req.query);
      sendPaginatedSuccess(res, result.data, result.pagination, 'Services retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getServicesByCategory(req, res, next) {
    try {
      const { category } = req.params;
      const result = await serviceRepository.findByCategory(category, req.query);
      sendPaginatedSuccess(res, result.data, result.pagination, 'Services retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req, res, next) {
    try {
      const service = await serviceRepository.findById(req.params.id);
      sendSuccess(res, service, 'Service retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getPopularServices(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 10;
      const services = await serviceRepository.findPopular(limit);
      sendSuccess(res, services, 'Popular services retrieved');
    } catch (error) {
      next(error);
    }
  }

  async searchServices(req, res, next) {
    try {
      const { term } = req.query;
      const result = await serviceRepository.search(term, req.query);
      sendPaginatedSuccess(res, result.data, result.pagination, 'Services found');
    } catch (error) {
      next(error);
    }
  }

  async createService(req, res, next) {
    try {
      const service = await serviceRepository.create(req.body);
      sendSuccess(res, service, 'Service created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req, res, next) {
    try {
      const service = await serviceRepository.update(req.params.id, req.body);
      sendSuccess(res, service, 'Service updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req, res, next) {
    try {
      await serviceRepository.delete(req.params.id);
      sendSuccess(res, null, 'Service deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ServiceController();
