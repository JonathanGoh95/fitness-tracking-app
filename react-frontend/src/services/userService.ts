import axios from "axios";
import type { User } from "../types/user";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const fetchUsers = async (token: string): Promise<User[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/workouts/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },});

    if (response.statusText !== "OK") {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

const deleteUser = async (token: string, userId: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },});

    if (response.statusText !== "OK") {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

export { fetchUsers, deleteUser };
