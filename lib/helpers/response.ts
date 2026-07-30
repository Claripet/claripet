import { NextResponse } from "next/server";

/** Standard success response */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/** Standard error response */
export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/** 401 Unauthorized */
export function unauthorized(message = "Unauthorized") {
  return error(message, 401);
}

/** 403 Forbidden */
export function forbidden(message = "Forbidden") {
  return error(message, 403);
}

/** 404 Not Found */
export function notFound(message = "Not found") {
  return error(message, 404);
}

/** 500 Internal Server Error */
export function serverError(message = "Internal server error") {
  return error(message, 500);
}
