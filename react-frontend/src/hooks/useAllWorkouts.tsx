import { useQuery } from "@tanstack/react-query";
import { getAllWorkouts, getWorkouts } from "../services/workoutService";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { Workout } from "../types/workout";

// Fetch all workouts
export const useAllWorkouts = () => {
  const user = useAtomValue(userAtom);

  return useQuery<Workout[]>({
    queryKey: ["workoutsall"],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      if (user.user_role === "admin") {
        return getAllWorkouts(user.token);
      }
      return getWorkouts(user.token);
    },
    enabled: !!user?.token,
    staleTime: 5000,
  });
};
