import type { AnyKeys, FilterQuery, Model, SortOrder, UpdateQuery } from 'mongoose';
import type { AuditFields } from '../interfaces/base.interface.js';

export interface PaginatedResult<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
}

export interface FindAllParams<T> {
  readonly filter?: FilterQuery<T>;
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: Record<string, SortOrder>;
}

const NOT_DELETED = { deletedAt: null };

/**
 * Generic persistence layer. Deliberately never throws a "not found" error —
 * that's an HTTP/domain concept owned by the service layer. Repositories
 * report absence as `null` and let callers decide what it means.
 *
 * Soft delete: `delete()` sets `deletedAt`; all reads exclude soft-deleted
 * documents by default. Use `hardDelete()`/`restore()` when the caller
 * explicitly needs to bypass that.
 */
export abstract class BaseRepository<T extends AuditFields> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: AnyKeys<T>): Promise<T> {
    const document = new this.model(data);
    return document.save();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, ...NOT_DELETED } as FilterQuery<T>).exec();
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne({ ...filter, ...NOT_DELETED } as FilterQuery<T>).exec();
  }

  async findAll(params: FindAllParams<T> = {}): Promise<PaginatedResult<T>> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    const filter = { ...(params.filter ?? {}), ...NOT_DELETED } as FilterQuery<T>;

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(params.sort).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id, ...NOT_DELETED } as FilterQuery<T>, data, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  /** Soft delete — sets `deletedAt`, document remains in the collection. */
  async delete(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, ...NOT_DELETED } as FilterQuery<T>,
        { deletedAt: new Date() } as UpdateQuery<T>,
        { new: true }
      )
      .exec();
  }

  async restore(id: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, deletedAt: { $ne: null } } as FilterQuery<T>,
        { deletedAt: null } as UpdateQuery<T>,
        { new: true }
      )
      .exec();
  }

  async hardDelete(id: string): Promise<T | null> {
    return this.model.findOneAndDelete({ _id: id } as FilterQuery<T>).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments({ ...filter, ...NOT_DELETED } as FilterQuery<T>).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const result = await this.model.exists({ ...filter, ...NOT_DELETED } as FilterQuery<T>).exec();
    return result !== null;
  }
}
