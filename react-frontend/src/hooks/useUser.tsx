import { useQuery } from "@tanstack/react-query";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import type { User } from "../types/user";
import { fetchUser } from "../services/userService";

// Fetch all workouts
export const useUser = () => {
  const user = useAtomValue(userAtom)

  return useQuery<User>({
    queryKey: ["user", user?.id],
    queryFn: () => {
      if (!user?.token) throw new Error("User not authenticated");
      return fetchUser(user.token, user?.id)
    },
    enabled: !!user?.token,
    staleTime: 5000
  });
};
