import { useQuery } from "@tanstack/react-query";
import { getUserWorkouts } from "../services/workoutService";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { Workout } from "../types/workout";

// Fetch all workouts
export const useWorkoutsByUserId = (userId: number) => {
  const user = useAtomValue(userAtom);

  return useQuery<Workout[]>({
    queryKey: ["workouts", userId],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      return getUserWorkouts(user.token, userId);
    },
    enabled: !!user?.token,
    staleTime: 5000,
  });
};
