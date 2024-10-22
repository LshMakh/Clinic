import { first } from "rxjs";

export interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    personalNumber: string;
    role: string;
    password: string;
}