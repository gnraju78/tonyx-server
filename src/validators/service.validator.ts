import { z } from 'zod';

const CATEGORY_VALUES = ['haircut', 'styling', 'coloring', 'treatment', 'other'] as const;
const SENIORITY_VALUES = ['beginner', 'intermediate', 'advanced', 'expert'] as const;

const serviceImageSchema = z.object({
  public_id: z.string(),
  url: z.string().url(),
});

const requirementsSchema = z
  .object({
    minSeniorityLevel: z.enum(SENIORITY_VALUES).optional(),
    tools: z.array(z.string()).optional(),
    products: z.array(z.string()).optional(),
  })
  .strict()
  .optional();

export const createServiceSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().min(10).max(1000),
    category: z.enum(CATEGORY_VALUES),
    basePrice: z.coerce.number().min(0),
    duration: z.coerce.number().int().min(5).max(480),
    image: serviceImageSchema.optional(),
    barberSpecialists: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    requirements: requirementsSchema,
    tags: z.array(z.string()).optional(),
  })
  .strict();

export const updateServiceSchema = createServiceSchema.partial();

export const serviceListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  sort: z.string().optional(),
});

export const searchServiceQuerySchema = serviceListQuerySchema.extend({
  term: z.string().trim().min(1),
  category: z.enum(CATEGORY_VALUES).optional(),
});

export const categoryParamSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
});

export const popularServicesQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
export type SearchServiceQueryDto = z.infer<typeof searchServiceQuerySchema>;
export type PopularServicesQueryDto = z.infer<typeof popularServicesQuerySchema>;
