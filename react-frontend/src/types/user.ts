export interface User {
  id: number;
  username: string;
  user_weight: number;
  role: "user" | "admin";
  token?: string;
}

export interface UserSignUp {
  username: string;
  email: string;
  password: string;
  user_weight: number;
}

export interface UserSignIn {
  username: string;
  password: string;
}