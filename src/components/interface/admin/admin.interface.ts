export interface Admin {
  name: string;
  phoneNumber: string;
  isSuper: boolean;
}

export interface IRegisterAdmin extends Admin {
  password: string;
}
