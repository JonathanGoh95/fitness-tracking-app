import { Link } from "react-router";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { RESET } from "jotai/utils";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

export const NavBar = () => {
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(RESET);
    toast.success("Successfully Signed Out. Redirecting to Dashboard...");
    setTimeout(() => {
      navigate(`/`);
    }, 500);
  };

  return (
    <div className="navbar flex justify-between bg-black text-white shadow-sm">
      <div className="ml-2 flex text-xl">
        <Link to={"/"}>🏋🏽🔥FitTrack💪🏼🎧</Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1 text-xl">
          <li>
            <Link to="/workouts">View Workouts</Link>
          </li>
          <li>
            <Link to="/workouts/new">Add Workout</Link>
          </li>
          {user && user.user_role === "admin" && (
            <>
              <li>
                <p className="cursor-default hover:bg-transparent focus:bg-transparent">
                  Welcome, Admin {user.username}
                </p>
              </li>
              <li>
                <Link to="/sign-up">Add Admin Account</Link>
              </li>
              <li>
                <Link to="/users">View User Accounts</Link>
              </li>
              <li>
                <Link to={`/users/${user.id}/edit`}>Edit Profile</Link>
              </li>
              <li>
                <Link to="/metvalues">View MET Values</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
          {user && user.user_role === "user" && (
            <>
              <li>
                <p className="cursor-default hover:bg-transparent focus:bg-transparent">
                  Welcome, {user.username}
                </p>
              </li>
              <li>
                <Link to={`/users/${user.id}/edit`}>Edit Profile</Link>
              </li>
              <li>
                <Link to="/metvalues">View MET Values</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
          {!user && (
            <>
              <li>
                <Link to="/sign-up">Sign Up</Link>
              </li>
              <li>
                <Link to="/sign-in">Sign In</Link>
              </li>
              <li>
                <Link to="/metvalues">View MET Values</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
