import type { FC } from "react";
import { signUp } from '../services/authService';
import { useAtom, useSetAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { errorAtom } from '../atoms/errorAtom';
import { useNavigate } from 'react-router';

export const SignUpPage: FC = () => {
  const navigate = useNavigate()
  const setUser = useSetAtom(userAtom);
  const [error,setError] = useAtom(errorAtom)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
    };

    if (data.password !== data.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    // Remove passwordConfirm before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...submitData } = data;
    const result = await signUp(submitData);
    if (result && result.payload) {
      setUser(result.payload);
      setError(null);
      navigate("/")
    } else {
      setError("Sign Up failed. Please try again.");
      return;
    }
  }

  return (
  <div className="w-full max-w-lg px-4">
    <form onSubmit={handleSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Sign Up</legend>
        {error && <div className="text-red-500">{error}</div>}
          <label className="text-sm/6 font-medium text-white">Username</label>
          <input type='text' name='username' required className="input" placeholder="Username"/>

          <label className="text-sm/6 font-medium text-white">Email</label>
          <input type='email' name='email' required className="input" placeholder="Email"/>

          <label className="text-sm/6 font-medium text-white">Password</label>
          <input type='password' name='password' required className="Password"/>

          <label className="text-sm/6 font-medium text-white">Confirm Password</label>
          <input type='password' name='passwordConfirm' required className="Confirm Password"/>

          <button className="btn btn-neutral mt-4">Submit</button>
      </fieldset>
    </form>
  </div>
  );
};