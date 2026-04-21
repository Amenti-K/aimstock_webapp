export interface ILogin {
  phoneNumber: string;
  password: string;
}

export interface IRegistration {
  name: string;
  phoneNumber: string;
  companyName: string;
  password: string;
  confirmPassword: string;
}
