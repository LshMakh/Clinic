export interface ApiErrorResponse {
    message: string;
    errorCode: string;
    isError: boolean;
  }
  
  export class BusinessException extends Error {
    constructor(public override message: string, public errorCode: string) {
      super(message);
      this.name = 'BusinessException';
    }
  }
  
  export const ErrorCodes = {
    NotFound: 'NOT_FOUND',
    ValidationError: 'VALIDATION_ERROR',
    Unauthorized: 'UNAUTHORIZED',
    Conflict: 'CONFLICT',
    DatabaseError: 'DATABASE_ERROR',
    GeneralError: 'GENERAL_ERROR',
    SlotNotAvailable: 'SLOT_NOT_AVAILABLE',
    InvalidAppointmentDate: 'INVALID_APPOINTMENT_DATE',
    AppointmentNotFound: 'APPOINTMENT_NOT_FOUND',
    UserNotFound: 'USER_NOT_FOUND',
    InvalidCredentials: 'INVALID_CREDENTIALS',
    EmailExists: 'EMAIL_EXISTS'
  } as const;