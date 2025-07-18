import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { useNavigate } from "react-router";
import { BannerImage } from "../components/BannerImage";

export const Dashboard = () => {
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();

  return (
    <>
      <BannerImage />
      {user && user.user_role === "user" ? (
        <div className="flex min-h-[40vh] flex-col items-center gap-4 justify-self-center text-4xl italic">
          <h1>Welcome Back, {user.username}!</h1>
          <p>Here is an overview of your latest activities:</p>
        </div>
      ) : user && user.user_role === "admin" ? (
        <div className="flex min-h-[40vh] flex-col items-center gap-4 justify-self-center text-4xl italic">
          <h1>Welcome Back, Admin {user.username}!</h1>
          <p>Create additional admin accounts or view/edit user accounts!</p>
        </div>
      ) : (
        <>
          <div className="my-6 flex justify-center text-3xl italic">
            <h1>
              Start Tracking your Fitness Journey and Monitor your Progress
              easily!
            </h1>
          </div>
          <div className="flex justify-center gap-4">
            <button
              className="btn btn-neutral mt-4 text-lg italic"
              onClick={() => navigate("/sign-up")}
            >
              Sign Up
            </button>
            <button
              className="btn btn-neutral mt-4 text-lg italic"
              onClick={() => navigate("/sign-in")}
            >
              Sign In
            </button>
          </div>
        </>
      )}
    </>
  );
};
