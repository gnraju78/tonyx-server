export const getPaginationParams = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildQuery = (query) => {
  const filter = { ...query };

  // Remove pagination params
  delete filter.page;
  delete filter.limit;
  delete filter.sort;
  delete filter.fields;

  // Build query string for advanced filtering
  let queryStr = JSON.stringify(filter);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  return JSON.parse(queryStr);
};

export const getSortParams = (sortQuery) => {
  if (!sortQuery) return {};

  const sortFields = sortQuery.split(',').reduce((acc, field) => {
    const fieldName = field.startsWith('-') ? field.slice(1) : field;
    const sortOrder = field.startsWith('-') ? -1 : 1;
    acc[fieldName] = sortOrder;
    return acc;
  }, {});

  return sortFields;
};

export const getFieldSelection = (fieldsQuery) => {
  if (!fieldsQuery) return {};

  const fields = fieldsQuery.split(',').reduce((acc, field) => {
    const fieldName = field.trim();
    acc[fieldName] = 1;
    return acc;
  }, {});

  return fields;
};

export default {
  getPaginationParams,
  buildQuery,
  getSortParams,
  getFieldSelection,
};
