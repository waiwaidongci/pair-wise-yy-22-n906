import { ERROR_CODES } from "../constants/errorCodes";

export type ErrorCode = keyof typeof ERROR_CODES;

export class HttpError extends Error {
  status: number;
  code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
