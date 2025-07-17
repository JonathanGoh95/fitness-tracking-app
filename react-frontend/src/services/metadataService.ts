import axios from "axios";
import type { WorkoutMetadata } from "../types/metadata";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getWorkoutMetadata = async (token: string): Promise<WorkoutMetadata> => {
  try {
    const response = await axios.get(`${BASE_URL}/workouts/metadata`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },});
    // Axios will throw error if status is not of 2XX, so additional checks are not needed 
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout metadata: ", error);
    throw error;
  }
};

export { getWorkoutMetadata };
