import type { FC } from "react";
import { userAtom } from "../atoms/userAtom";
import { useAtomValue } from "jotai";
import { useParams } from "react-router";

export const EditUserPage: FC = () => {
    const { userId } = useParams();
    const user = useAtomValue(userAtom)

    return (
    <>
    {user?.id !== userId && user?.user_role !== 'admin' && <h1>As a user, you are not allowed to edit another user's profile!</h1>}
    {user && user?.user_role === 'admin' && (
        <>
        </>
    )}
    {user && user?.user_role === 'user' && (
        <>
        </>
    )}
    </>)
}