import axios from "axios";
import type { UserSignUp,User } from "../types/user";
import { jwtDecode } from "jwt-decode"

const BASE_URL = "http://localhost:5000";

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
