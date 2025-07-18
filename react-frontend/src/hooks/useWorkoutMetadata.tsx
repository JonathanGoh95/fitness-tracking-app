import { useQuery } from "@tanstack/react-query";
import { getWorkoutMetadata } from "../services/metadataService";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { WorkoutMetadata } from "../types/metadata";

// Fetch all workouts
export const useWorkoutMetadata = () => {
  const user = useAtomValue(userAtom);

  return useQuery<WorkoutMetadata>({
    queryKey: ["metadata"],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      return getWorkoutMetadata(user.token);
    },
    enabled: !!user?.token,
    staleTime: 5000,
  });
};
