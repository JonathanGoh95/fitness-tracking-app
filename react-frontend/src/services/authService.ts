import axios from "axios";
import type { UserSignUp,User } from "../types/user";
import { jwtDecode } from "jwt-decode"

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const signUp = async (data: UserSignUp) => {
  try {
    const response = await axios.post(`${BASE_URL}/sign-up`, data);
    if (response.statusText !== "OK") {
      throw new Error(`Response status: ${response.status}`);
    }
    const token:string = response.data.token
    const payload: User = jwtDecode(response.data.token)
    if (token){
      return {payload, token}
    }
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error;
  }
};

export { signUp };
