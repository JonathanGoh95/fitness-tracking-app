import axios from "axios";
import type { UserSignUp, UserSignIn, User } from "../types/user";
// import { jwtDecode } from "jwt-decode"

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const signUp = async (data: UserSignUp) => {
  try {
    const response = await axios.post(`${BASE_URL}/sign-up`, data);
    // Axios will throw error if status is not of 2XX, so additional checks are not needed
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    const token: string = response.data.token;
    // Decode payload using JSON parse and atob method
    const payload: User = JSON.parse(atob(token.split(".")[1]));
    if (token) {
      return { payload, token };
    }
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error;
  }
};

const adminSignUp = async (token: string, data: UserSignUp) => {
  try {
    const response = await axios.post(`${BASE_URL}/admin/sign-up`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Axios will throw error if status is not of 2XX, so additional checks are not needed
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error creating admin: ", error);
    throw error;
  }
};

const signIn = async (data: UserSignIn) => {
  try {
    const response = await axios.post(`${BASE_URL}/sign-in`, data);
    // Axios will throw error if status is not of 2XX, so additional checks are not needed
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    const token: string = response.data.token;
    const payload: User = JSON.parse(atob(token.split(".")[1]));
    if (token) {
      return { payload, token };
    }
  } catch (error) {
    console.error("Error creating user: ", error);
    throw error;
  }
};

export { signUp, adminSignUp, signIn };
