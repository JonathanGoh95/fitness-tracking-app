import axios from "axios";
import type { Workout } from "../types/workout";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getWorkouts = async (): Promise<Workout[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/workouts`);
    if (response.statusText !== "OK") {
      throw new Error(`Response status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

export { getWorkouts };
