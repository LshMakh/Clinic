import { first } from "rxjs";

export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    personalNumber: string;
    role: string;
    password?: string;
    // Additional fields for doctors
    doctorId?:number;
    specialization?: string;
    rating?: number;
    photoUrl?: string;
    cvUrl?:string;
}