export class UserLoginDto{
    public email:string;
    public password:string;
    constructor(email:string,password:string){
        this.email = email;
        this.password = password;
    }
}

export class ResetPasswordDto{
    public email:string;
    constructor(email:string){
        this.email = email
    }
}


export interface PasswordChangeDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }