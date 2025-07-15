import type { FC } from "react";
import { Link } from "react-router";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom";

export const NavBar: FC = () => {
  const user = useAtomValue(userAtom)

  return (
  <div className="navbar bg-base-100 shadow-sm flex justify-between bg-black text-white">
    <div>
      <Link to={'/'}>🏋🏽🔥FitTrack💪🏼🎧</Link>
    </div>
    <div className="flex gap-4">
      <Link to='/workouts'>View Workouts</Link>
      <Link to='/workouts/new'>Add Workout</Link>
      {user && user.user_role === 'admin' && (
        <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><p>Welcome, Admin {user.username}</p></li>
          <li><Link to="/sign-up">Add Admin Account</Link></li>
          <li><Link to="/users">View User Accounts</Link></li>
        </ul>
      </div>
      )}
      {user && user.user_role === 'user' ? (
        <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><p>Welcome, {user.username}</p></li>
          <li><Link to={`/users/${user.id}/edit`}>Edit Profile</Link></li>
        </ul>
      </div>
      ):(
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/sign-up">Sign Up</Link></li>
          <li><Link to="/sign-in">Sign In</Link></li>
        </ul>
      </div>
    )}
    </div>
  </div>
  );
};
