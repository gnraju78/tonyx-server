export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};

export const sendPaginatedSuccess = (
  res,
  data,
  pagination,
  message = 'Success',
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
    pagination: {
      total: pagination.total,
      limit: pagination.limit,
      page: pagination.page,
      pages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page * pagination.limit < pagination.total,
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

export default {
  sendSuccess,
  sendError,
  sendPaginatedSuccess,
};
