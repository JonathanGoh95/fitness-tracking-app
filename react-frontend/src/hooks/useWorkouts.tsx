import { useQuery } from "@tanstack/react-query";
import { getWorkouts } from "../services/workoutService";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { Workout } from "../types/workout";

// Fetch all workouts
export const useWorkouts = () => {
  const user = useAtomValue(userAtom)

  return useQuery<Workout[]>({
    queryKey: ["workouts"],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      return getWorkouts(user.token, user.id)
    },
    enabled: !!user?.token,
    staleTime: 10000
  });
};
