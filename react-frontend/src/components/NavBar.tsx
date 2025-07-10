import type { FC } from "react";
import { Link } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom";

export const NavBar: FC = () => {
  const user = useAtomValue(userAtom)

  return (
  <div className="flex justify-between bg-black text-white">
    <div>
      <Link to={'/'}>🏋🏽🔥FitTrack💪🏼🎧</Link>
    </div>
    <div className="flex gap-4">
      <Link to='/workouts'>View Workouts</Link>
      <Link to='/workouts/new'>Add Workout</Link>
      {user ? (
      <p>Welcome, {user.username}</p>
      ):(
      <div>
        <Link to="/sign-up">Sign Up</Link>
        <Link to="/sign-in">Sign In</Link>
      </div>
    )}
    </div>
  </div>
  );
};
