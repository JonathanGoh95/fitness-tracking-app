import type { FC } from "react";
import { signIn } from '../services/authService';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { errorAtom } from '../atoms/errorAtom';
import { useNavigate } from 'react-router';
import { loadingAtom } from "../atoms/loadingAtom";
import { toast } from "react-toastify";

export const SignInPage: FC = () => {
  const navigate = useNavigate()
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useAtom(loadingAtom)
  const [error,setError] = useAtom(errorAtom)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };
    setLoading(true)
    try{
      const result = await signIn(data);
      if (result && result.payload) {
        setUser(result.payload);
        toast.success("Sign In Successful. Redirecting to Dashboard...")
        setError(null);
        setTimeout(() => {
          navigate(`/`);
        }, 1500);
      } else {
        setError("Sign In failed. Please try again.");
      }
    } catch (err) {
      setError("Server Error: " + err);
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="w-full max-w-lg px-4">
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Sign In</legend>
        {error && <div className="text-red-500">{error}</div>}
          <label className="text-sm/6 font-medium text-white">Username</label>
          <input type='text' name='username' required className="input" placeholder="Username"/>

          <label className="text-sm/6 font-medium text-white">Password</label>
          <input type='password' name='password' required className="input"/>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-neutral mt-4" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
            <button type="button" className="btn btn-neutral mt-4" onClick={() => navigate("/")}>Back</button>
          </div>
      </fieldset>
    </form>
  </div>
  );
};