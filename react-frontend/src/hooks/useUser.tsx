import { useQuery } from "@tanstack/react-query";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { User } from "../types/user";
import { fetchUser } from "../services/userService";

// Fetch all workouts
export const useUser = (userId?: number) => {
  const user = useAtomValue(userAtom);

  return useQuery<User>({
    queryKey: ["user", userId || user?.id],
    queryFn: () => {
      const id = userId || user?.id;
      if (!user?.token) throw new Error("User not authenticated");
      if (!id) throw new Error("User ID is required");
      return fetchUser(user.token, id);
    },
    enabled: !!user?.token && !!(userId || user?.id),
    staleTime: 5000,
  });
};
