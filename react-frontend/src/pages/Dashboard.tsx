import type { FC } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { Button } from '@headlessui/react'
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
        <Button className="rounded bg-sky-600 px-4 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500" onClick={() => navigate("/sign-up")}>Sign Up</Button>
        <Button className="rounded bg-sky-600 px-4 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500" onClick={() => navigate("/sign-in")}>Sign In</Button>
      </div>
    </>
    )}
  </>);
};
