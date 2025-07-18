export interface User {
  id: number;
  username: string;
  email: string;
  user_weight: number;
  user_role: "user" | "admin";
  token?: string;
}

export interface UserSignUp {
  username: string;
  email: string;
  password: string;
  user_weight: number;
}

export interface UpdateUser {
  username: string;
  email: string;
  user_weight: number;
}

export interface UserSignIn {
  username: string;
  password: string;
}
