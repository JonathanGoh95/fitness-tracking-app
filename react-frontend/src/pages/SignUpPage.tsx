import { useEffect, useRef } from "react";
import { signUp } from "../services/authService";
import { adminSignUp } from "../services/authService";
import { useAtom } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { errorAtom } from "../atoms/errorAtom";
import { useNavigate } from "react-router";
import { loadingAtom } from "../atoms/loadingAtom";
import { toast } from "react-toastify";
import { BannerImage } from "../components/BannerImage";
import { formValidityAtom } from "../atoms/formValidityAtom";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useAtom(formValidityAtom);

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
      setError("Error: Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(data);
      if (result && result.payload) {
        setUser({ ...result.payload, token: result.token });
        toast.success(
          "Account Successfully Created. Redirecting to Dashboard..."
        );
        setError(null);
        setTimeout(() => {
          navigate(`/`);
        }, 250);
      } else {
        setError("Sign Up Failed. Please try again.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message;
      setError(
        serverMsg
          ? `Sign Up failed: ${serverMsg}`
          : "Server Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

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
      setError("Error: Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const result = await adminSignUp(user?.token ?? "", data);
      if (result) {
        toast.success(
          "Admin Account Successfully Created. Redirecting to Dashboard..."
        );
        setError(null);
        setTimeout(() => {
          navigate(`/`);
        }, 250);
      } else {
        setError("Admin Account Creation Failed. Please try again.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message;
      setError(
        serverMsg
          ? `Admin Sign Up failed: ${serverMsg}`
          : "Server Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Removes the error message when navigating back to this page
  useEffect(() => {
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = () => {
    if (formRef.current) {
      setIsFormValid(formRef.current.checkValidity());
    }
  };

  return (
    <>
      <BannerImage />
      {user && user.user_role === "admin" ? (
        <div className="flex items-center justify-center py-4">
          <form
            ref={formRef}
            onSubmit={handleAdminSubmit}
            onInput={handleInput}
          >
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-sm border p-4">
              <legend className="fieldset-legend text-xl italic">
                Create Admin Account
              </legend>
              {error && <div className="text-red-500">{error}</div>}
              <label className="text-sm/6 font-medium text-white">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Username"
                  pattern="[A-Za-z][A-Za-z0-9\-]*"
                  minLength={3}
                  maxLength={30}
                  title="Only letters, numbers or dash"
                />
                <span className="validator-hint">
                  Must be within 3 to 30 characters
                  <br />
                  containing only letters, numbers or dash
                </span>
              </div>
              <label className="text-sm/6 font-medium text-white">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Email"
                />
                <span className="validator-hint">
                  Enter valid email address
                </span>
              </div>
              <label className="text-sm/6 font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Password"
                  title="Must be more than 8 characters"
                  pattern="[A-Za-z0-9]{8,}"
                  minLength={8}
                />
                <span className="validator-hint">
                  Must be more than 8 characters
                </span>
              </div>
              <label className="text-sm/6 font-medium text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="passwordConfirm"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Confirm Password"
                  pattern="[A-Za-z0-9]{8,}"
                  minLength={8}
                />
                <span className="validator-hint">
                  Must be more than 8 characters
                </span>
              </div>
              <label className="text-sm/6 font-medium text-white">
                Body Weight (in KG, for Calculation of Calories Burned)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  className="input validator mb-1 w-full"
                  step={0.01}
                  min={0.01}
                  required
                  placeholder="Weight in KG"
                />
                <span className="validator-hint">
                  Weight must be greater than 0
                </span>
              </div>
              <div className="flex gap-4 justify-self-center">
                <button
                  type="submit"
                  className="btn btn-success mt-4"
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Creating Admin..." : "Create Admin"}
                </button>
                <button
                  type="button"
                  className="btn btn-soft mt-4"
                  onClick={() => navigate("/")}
                >
                  Back
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      ) : !user ? (
        <div className="flex items-center justify-center py-4">
          <form ref={formRef} onSubmit={handleUserSubmit} onInput={handleInput}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-sm border p-4">
              <legend className="fieldset-legend text-xl italic">
                Sign Up as a New User
              </legend>
              {error && <div className="text-red-500">{error}</div>}
              <label className="mb-1 text-sm/6 font-medium text-white">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Username"
                  pattern="[A-Za-z][A-Za-z0-9\-]*"
                  minLength={3}
                  maxLength={30}
                  title="Only letters, numbers or dash"
                />
                <span className="validator-hint">
                  Must be within 3 to 30 characters
                  <br />
                  containing only letters, numbers or dash
                </span>
              </div>
              <label className="mb-1 text-sm/6 font-medium text-white">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Email"
                />
                <span className="validator-hint">
                  Enter valid email address
                </span>
              </div>
              <label className="mb-1 text-sm/6 font-medium text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Password"
                  title="Must be more than 8 characters"
                  pattern="[A-Za-z0-9]{8,}"
                  minLength={8}
                />
                <span className="validator-hint">
                  Must be more than 8 characters
                </span>
              </div>
              <label className="mb-1 text-sm/6 font-medium text-white">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="passwordConfirm"
                  className="input validator mb-1 w-full"
                  required
                  placeholder="Confirm Password"
                  pattern="[A-Za-z0-9]{8,}"
                  minLength={8}
                />
                <span className="validator-hint">
                  Must be more than 8 characters
                </span>
              </div>
              <label className="mb-1 text-sm/6 font-medium text-white">
                Body Weight (in KG, for Calculation of Calories Burned)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  className="input validator mb-1 w-full"
                  step={0.01}
                  min={0.01}
                  required
                  placeholder="Weight in KG"
                />
                <span className="validator-hint">
                  Weight must be greater than 0
                </span>
              </div>
              <div className="flex gap-4 justify-self-center">
                <button
                  type="submit"
                  className="btn btn-success mt-4"
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </button>
                <button
                  type="button"
                  className="btn btn-soft mt-4"
                  onClick={() => navigate("/")}
                >
                  Back
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      ) : (
        <div className="my-6 flex justify-center text-3xl italic">
          <h1>
            As you are not an admin, you are not authorized to create admin
            accounts!
          </h1>
        </div>
      )}
    </>
  );
};
