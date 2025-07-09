import { useQuery } from "@tanstack/react-query";
import * as workoutService from "../services/workoutService";
import type { Workout } from "../types/workout";

// Fetch all workouts
export const useWorkouts = () => {
  return useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: workoutService.getWorkouts,
  });
};
