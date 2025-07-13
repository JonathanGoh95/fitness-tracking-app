import axios from "axios";
import type { Workout } from "../types/workout";
import type { AddWorkout } from "../types/workout";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getWorkouts = async (token: string, id: number): Promise<Workout[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/workouts/${id}`, {
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

const addWorkout = async (token: string, data: AddWorkout): Promise<Workout[]> => {
  try {
    const response = await axios.post(`${BASE_URL}/workouts/new`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }, data});

    if (response.statusText !== "OK") {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

const deleteWorkout = async (token: string, workoutId: number): Promise<Workout[]> => {
  try {
    const response = await axios.delete(`${BASE_URL}/workouts/${workoutId}`, {
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

export { getWorkouts, addWorkout, deleteWorkout };
