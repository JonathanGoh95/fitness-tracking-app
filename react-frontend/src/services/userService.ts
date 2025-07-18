import axios from "axios";
import type { User, UpdateUser } from "../types/user";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/users/`, {
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
    console.error("Error fetching users data: ", error);
    throw error;
  }
};

const fetchUser = async (token: string, userId: number): Promise<User> => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${userId}`, {
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
    console.error("Error fetching user data: ", error);
    throw error;
  }
};

const updateUser = async (
  token_old: string,
  userId: number,
  userData: UpdateUser
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/users/${userId}/edit`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token_old}`,
        },
      }
    );
    // Axios will throw error if status is not of 2XX, so additional checks are not needed
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    const token: string = response.data.token;
    if (token) {
      // User editing own profile - return payload and token
      const payload: User = JSON.parse(atob(token.split(".")[1]));
      return { payload, token };
    } else{
      // Admin editing another user - return success without token
      return { success: true, message: response.data.message };
    }
  } catch (error) {
    console.error("Error updating user: ", error);
    throw error;
  }
};

const deleteUser = async (token: string, userId: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
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
    console.error("Error deleting user: ", error);
    throw error;
  }
};

export { fetchUsers, fetchUser, updateUser, deleteUser };
