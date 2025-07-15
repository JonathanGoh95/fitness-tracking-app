import type { FC } from "react";
import { userAtom } from "../atoms/userAtom";
import { useAtom, useAtomValue } from "jotai";
import { useParams } from "react-router";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router";
import type { UpdateUser } from "../types/user";
import { loadingAtom } from "../atoms/loadingAtom";
import { errorAtom } from "../atoms/errorAtom";
import { updateUser } from "../services/userService";
import { toast } from "react-toastify";

export const EditUserPage: FC = () => {
    const { userId } = useParams();
    const user = useAtomValue(userAtom)
    const navigate = useNavigate()
    const [loading, setLoading] = useAtom(loadingAtom)
    const [errorMsg, setErrorMsg] = useAtom(errorAtom)

    const { isLoading, error, data } = useUser()
    
    if (isLoading) return <span className="loading loading-spinner loading-xl"></span>

    if (error) return 'An error has occurred: ' + error.message

    const handleAdminUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userData:UpdateUser = {
            username: formData.get("username") as string,
            email: formData.get("email") as string,
            user_weight: Number(formData.get("weight")),
        };
        setLoading(true)
        try{
            await updateUser(user?.token ?? "", Number(userId), userData)
            toast.success(`User Updated! Redirecting to ${user?.user_role === 'admin' ? "Users" : "Dashboard"}...`);
            setErrorMsg(null)
            setTimeout(() => {
                navigate(user?.user_role === 'admin' ? "/users" : "/");
            }, 1500);
        }catch(err){
            setErrorMsg("Server Error: " + err)
        }finally{
            setLoading(false)
        }
    }

    return (
    <>
    {user?.id !== Number(userId) && user?.user_role !== 'admin' && <h1>As you are not an admin, you are not allowed to edit another user's profile!</h1>}
    {(user?.user_role === 'admin' || (user?.id === Number(userId) && user?.user_role === 'user')) && (
    <div className="w-full max-w-lg px-4">
        <form onSubmit={handleAdminUpdate}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend">Update User</legend>
                {errorMsg && <div className="text-red-500">{errorMsg}</div>}
                <label className="text-sm/6 font-medium text-white">Username</label>
                <input type='text' name='username' className="input validator" required defaultValue={data?.username} pattern="[A-Za-z][A-Za-z0-9\-]*" minLength={3} maxLength={30} title="Only letters, numbers or dash"/>
                <p className="validator-hint text-red-500">Must be 3 to 30 characters<br/>containing only letters, numbers or dash</p>
                
                <label className="text-sm/6 font-medium text-white">Email</label>
                <input type='email' name='email' className="input validator" required defaultValue={data?.email}/>
                <p className="validator-hint text-red-500">Enter valid email address</p>

                <label className="text-sm/6 font-medium text-white">Body Weight (in KG, for Calculation of Calories Burned)</label>
                <input type='number' name='weight' className="input validator" step={0.01} min={0} required defaultValue={data?.user_weight}/>
                <p className="validator-hint text-red-500">Weight must be greater than 0</p>

                <div className="flex gap-4">
                    <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>{loading ? "Updating..." : "Update User"}</button>
                    <button type="button" className="btn btn-neutral mt-4" onClick={() => navigate(user.user_role === 'admin' ? "/users" : "/")}>Back</button>
                </div>
            </fieldset>
        </form>
    </div>
    )}
    </>)
}