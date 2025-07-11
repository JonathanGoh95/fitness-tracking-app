import type { FC } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { useNavigate } from "react-router";
import coverImage from "../../images/cover_image.jpg"

export const Dashboard: FC = () => {
  const user = useAtomValue(userAtom)
  const navigate = useNavigate()

  return (<>
    <div>
      <img className="rounded w-5/6 h-1/3" src={coverImage}/>
    </div>
    {user ? (
      <div className="flex-col content-center">
        <h1>Welcome back, {user.username}!</h1>
        <p>Here is an overview of your latest activities:</p>
      </div>
    )
    :(
    <>
      <h1>Start Tracking your Fitness Journey and Monitor your Progress easily!</h1>
      <div className="flex justify-center gap-4">
        <button className="btn btn-neutral mt-4" onClick={() => navigate("/sign-up")}>Sign Up</button>
        <button className="btn btn-neutral mt-4" onClick={() => navigate("/sign-in")}>Sign In</button>
      </div>
    </>
    )}
  </>);
};
