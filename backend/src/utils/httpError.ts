export type HttpError = Error & { status: number; code: string };

export const createHttpError = (status: number, code: string, message: string): HttpError =>
  Object.assign(new Error(message), { status, code });
