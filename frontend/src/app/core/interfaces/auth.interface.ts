export interface IUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface IUserRegistration {
  email: string;
  password: string;
  name: string;
}

export interface ILoginResponse {
  access_token: string;
  user: IUser;
} 