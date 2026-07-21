/**
 * Merged into schemas that support soft delete (the 4 entities actually
 * wired through repository/service/controller layers today: User, Booking,
 * Service, Payment). `createdAt`/`updatedAt` come from `{ timestamps: true }`
 * on each schema; this only adds the soft-delete marker.
 *
 * Deliberately NOT implemented as global query middleware (auto-filtering
 * every find/aggregate) — that pattern silently breaks populate() and
 * aggregate() pipelines and makes query behavior implicit. Instead,
 * BaseRepository explicitly filters `deletedAt: null` on reads, which is
 * predictable and easy to reason about.
 */
export const auditFields = {
  deletedAt: {
    type: Date,
    default: null,
    index: true,
  },
};
