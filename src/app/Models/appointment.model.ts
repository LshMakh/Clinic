export interface Appointment {
    appointmentId: number;
    doctorId: number;
    patientId: number;
    appointmentDate: Date;
    timeSlot: string;
    description?: string;
    isBlocked: boolean;
    doctorFirstName?: string;
    doctorLastName?: string;
    doctorSpecialty?: string;
    patientFirstName?: string;
    patientLastName?: string;
  }
  
  export interface TimeSlot {
    timeSlot: string;
    isAvailable: boolean;
    isBlocked: boolean;
    patientId?: number;
  }
  
  export interface CreateAppointmentDto {
    doctorId: number;
    appointmentDate: Date;
    timeSlot: string;
    description?: string;
  }

  export interface EditEvent {
    appointmentId: number;
    description: string;
  }