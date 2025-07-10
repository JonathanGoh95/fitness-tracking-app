export interface User {
  id: number;
  username: string;
  role: "user" | "admin";
  token?: string;
}

export interface UserSignUp {
  username: string;
  email: string;
  password: string;
}