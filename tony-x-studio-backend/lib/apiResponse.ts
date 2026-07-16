import { NextResponse } from 'next/server';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export const successResponse = <T>(
  data: T,
  message: string = 'Success',
  status: number = 200
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
};

export const errorResponse = (
  message: string,
  errors?: Record<string, string[]>,
  status: number = 400
): NextResponse<ApiResponse<null>> => {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
};

export const unauthorizedResponse = (
  message: string = 'Unauthorized'
): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, undefined, 401);
};

export const forbiddenResponse = (
  message: string = 'Forbidden'
): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, undefined, 403);
};

export const notFoundResponse = (
  message: string = 'Not Found'
): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, undefined, 404);
};

export const conflictResponse = (
  message: string = 'Conflict',
  errors?: Record<string, string[]>
): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, errors, 409);
};

export const serverErrorResponse = (
  message: string = 'Internal Server Error'
): NextResponse<ApiResponse<null>> => {
  return errorResponse(message, undefined, 500);
};
