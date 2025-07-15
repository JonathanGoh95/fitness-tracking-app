import axios from "axios";
import type { Workout, AddEditWorkout, FetchWorkout } from "../types/workout";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const getWorkouts = async (token: string): Promise<Workout[]> => {
  try {
    const response = await axios.get(`${BASE_URL}/workouts/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },});
    // Axios will throw error if status is not of 2XX, so additional checks are not needed 
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

const addWorkout = async (token: string, data: AddEditWorkout) => {
  try {
    const response = await axios.post(`${BASE_URL}/workouts/new`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }, data});
    // Axios will throw error if status is not of 2XX, so additional checks are not needed 
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

const fetchOneWorkout = async (token: string, workoutId: number): Promise<FetchWorkout> => {
  try {
    const response = await axios.get(`${BASE_URL}/${workoutId}/edit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }});
    // Axios will throw error if status is not of 2XX, so additional checks are not needed 
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

const updateWorkout = async (token: string, workoutId: number, data: AddEditWorkout)=> {
  try {
    const response = await axios.put(`${BASE_URL}/${workoutId}/edit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }, data});
    // Axios will throw error if status is not of 2XX, so additional checks are not needed 
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

const deleteWorkout = async (token: string, workoutId: number) => {
  try {
    const response = await axios.delete(`${BASE_URL}/workouts/${workoutId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },});
    // Axios will throw error if status is not of 2XX, so additional checks are not needed 
    // if (response.statusText !== "OK") {
    //   throw new Error(`Response status: ${response.status}`);
    // }
    return response.data;
  } catch (error) {
    console.error("Error fetching workout data: ", error);
    throw error;
  }
};

export { getWorkouts, addWorkout, fetchOneWorkout, updateWorkout, deleteWorkout };
