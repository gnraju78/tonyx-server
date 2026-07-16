import { getPaginationParams, buildQuery, getSortParams } from '../utils/pagination.js';
import { AppError } from '../utils/AppError.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const document = await this.model.findById(id);
      if (!document) {
        throw AppError.notFound(`${this.model.modelName} not found`);
      }
      return document;
    } catch (error) {
      throw error;
    }
  }

  async findOne(filter) {
    try {
      const document = await this.model.findOne(filter);
      return document;
    } catch (error) {
      throw error;
    }
  }

  async findAll(query = {}) {
    try {
      const { page, limit, skip } = getPaginationParams(query);
      const filter = buildQuery(query);
      const sort = getSortParams(query.sort);

      const total = await this.model.countDocuments(filter);
      const documents = await this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      return {
        data: documents,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const document = await this.model.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!document) {
        throw AppError.notFound(`${this.model.modelName} not found`);
      }

      return document;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);

      if (!document) {
        throw AppError.notFound(`${this.model.modelName} not found`);
      }

      return document;
    } catch (error) {
      throw error;
    }
  }

  async bulkCreate(data) {
    try {
      return await this.model.insertMany(data);
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdate(ids, data) {
    try {
      const result = await this.model.updateMany(
        { _id: { $in: ids } },
        data,
        { multi: true }
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  async bulkDelete(ids) {
    try {
      const result = await this.model.deleteMany({ _id: { $in: ids } });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async count(filter = {}) {
    try {
      return await this.model.countDocuments(filter);
    } catch (error) {
      throw error;
    }
  }

  async exists(filter) {
    try {
      const document = await this.model.exists(filter);
      return !!document;
    } catch (error) {
      throw error;
    }
  }
}

export default BaseRepository;
