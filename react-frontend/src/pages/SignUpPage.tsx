import type { FC } from "react";
import { signUp } from '../services/authService';
import { adminSignUp } from '../services/authService';
import { useAtom } from 'jotai';
import { userAtom } from '../atoms/userAtom';
import { errorAtom } from '../atoms/errorAtom';
import { useNavigate } from 'react-router';
import { toast } from "react-toastify";

export const SignUpPage: FC = () => {
  const navigate = useNavigate()
  const [user,setUser] = useAtom(userAtom);
  const [error,setError] = useAtom(errorAtom)
  
  const handleUserSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
      user_weight: Number(formData.get("weight")),
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
      toast.success("Account Successfully Created. Redirecting to Dashboard...")
      setError(null);
      setTimeout(() => {
        navigate(`/`);
      }, 1500);
    } else {
      setError("Sign Up Failed. Please try again.");
      return;
    }
  }
  
  const handleAdminSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      passwordConfirm: formData.get("passwordConfirm") as string,
      user_weight: Number(formData.get("weight")),
    };

    if (data.password !== data.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }
    // Remove passwordConfirm before sending to backend
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordConfirm, ...submitData } = data;
    const result = await adminSignUp(user?.token ?? "", submitData);
    if (result) {
      toast.success("Admin Account Successfully Created. Redirecting to Dashboard...")
      setError(null);
      setTimeout(() => {
        navigate(`/`);
      }, 1500);
    } else {
      setError("Admin Account Creation Failed. Please try again.");
      return;
    }
  }

  return (
  <>
  {user && user.user_role === 'admin' ? (
    <div className="w-full max-w-lg px-4">
    <form onSubmit={handleAdminSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Create Admin Account</legend>
        {error && <div className="text-red-500">{error}</div>}
          <label className="text-sm/6 font-medium text-white">Username</label>
          <input type='text' name='username' className="input validator" required placeholder="Username" pattern="[A-Za-z][A-Za-z0-9\-]*" minLength={3} maxLength={30} title="Only letters, numbers or dash"/>
          <p className="validator-hint text-red-500">Must be 3 to 30 characters<br/>containing only letters, numbers or dash</p>
          
          <label className="text-sm/6 font-medium text-white">Email</label>
          <input type='email' name='email' className="input validator" required placeholder="Email"/>
          <p className="validator-hint text-red-500">Enter valid email address</p>

          <label className="text-sm/6 font-medium text-white">Password</label>
          <input type='password' name='password' className="input validator" required placeholder="Password" title="Must be more than 8 characters" pattern="[A-Za-z0-9]{8,}" minLength={8}/>
          <p className="validator-hint text-red-500">Must be more than 8 characters</p>

          <label className="text-sm/6 font-medium text-white">Confirm Password</label>
          <input type='password' name='passwordConfirm' className="input" required placeholder="Confirm Password" minLength={8}/>

          <label className="text-sm/6 font-medium text-white">Body Weight (in KG, for Calculation of Calories Burned)</label>
          <input type='number' name='weight' className="input validator" step={0.01} min={0} required placeholder="Weight in KG"/>
          <p className="validator-hint text-red-500">Weight must be greater than 0</p>

          <button className="btn btn-neutral mt-4">Submit</button>
      </fieldset>
    </form>
  </div>
  ) : !user ? (
    <div className="w-full max-w-lg px-4">
    <form onSubmit={handleUserSubmit}>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">Sign Up</legend>
        {error && <div className="text-red-500">{error}</div>}
          <label className="text-sm/6 font-medium text-white">Username</label>
          <input type='text' name='username' className="input validator" required placeholder="Username" pattern="[A-Za-z][A-Za-z0-9\-]*" minLength={3} maxLength={30} title="Only letters, numbers or dash"/>
          <p className="validator-hint text-red-500">Must be 3 to 30 characters<br/>containing only letters, numbers or dash</p>
          
          <label className="text-sm/6 font-medium text-white">Email</label>
          <input type='email' name='email' className="input validator" required placeholder="Email"/>
          <p className="validator-hint text-red-500">Enter valid email address</p>

          <label className="text-sm/6 font-medium text-white">Password</label>
          <input type='password' name='password' className="input validator" required placeholder="Password" title="Must be more than 8 characters" pattern="[A-Za-z0-9]{8,}" minLength={8}/>
          <p className="validator-hint text-red-500">Must be more than 8 characters</p>

          <label className="text-sm/6 font-medium text-white">Confirm Password</label>
          <input type='password' name='passwordConfirm' className="input" required placeholder="Confirm Password" minLength={8}/>

          <label className="text-sm/6 font-medium text-white">Body Weight (in KG, for Calculation of Calories Burned)</label>
          <input type='number' name='weight' className="input validator" step={0.01} min={0} required placeholder="Weight in KG"/>
          <p className="validator-hint text-red-500">Weight must be greater than 0</p>

          <button className="btn btn-neutral mt-4">Submit</button>
      </fieldset>
    </form>
  </div>
  ) : (
    <h1>As you are not an admin, you are not authorized to create admin accounts!</h1>
  )}
  </>
  );
};