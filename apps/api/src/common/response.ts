export class ServiceResponse<T = any> {
  public success: boolean;
  public message: string;
  public data: T | null;
  public statusCode: number;

  constructor(success: boolean, message: string, data: T | null, statusCode: number) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(message: string, data: T, statusCode = 200) {
    return new ServiceResponse(true, message, data, statusCode);
  }

  static failure<T>(message: string, data: T | null, statusCode = 400) {
    return new ServiceResponse(false, message, data, statusCode);
  }
}
