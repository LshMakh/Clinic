import { SafeUrl } from "@angular/platform-browser";

export class DoctorCard {
  constructor(
    public userId:number=0,
    public doctorId: number = 0,
    public firstName: string = '',
    public lastName: string = '',
    public email:string = '',
    public personalNumber = '',
    public specialty: string = '',
    
    public rating: number = 0,
    public isPinned:boolean = false,
    public photoUrl?: SafeUrl
  ) {}
}

export interface DoctorPhoto {
  url: string;
  isLoading: boolean;
}
