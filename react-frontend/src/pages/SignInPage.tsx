import { useEffect } from "react";
import { signIn } from "../services/authService";
import { useAtom, useSetAtom } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { errorAtom } from "../atoms/errorAtom";
import { useNavigate } from "react-router";
import { loadingAtom } from "../atoms/loadingAtom";
import { toast } from "react-toastify";
import { BannerImage } from "../components/BannerImage";

export const SignInPage = () => {
  const navigate = useNavigate();
  const setUser = useSetAtom(userAtom);
  const [loading, setLoading] = useAtom(loadingAtom);
  const [error, setError] = useAtom(errorAtom);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    };
    setLoading(true);
    try {
      const result = await signIn(data);
      if (result && result.payload) {
        setUser({ ...result.payload, token: result.token });
        toast.success("Sign In Successful. Redirecting to Dashboard...");
        setError(null);
        setTimeout(() => {
          navigate(`/`);
        }, 250);
      } else {
        setError("Sign In failed. Please try again.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message;
      setError(
        serverMsg
          ? `Sign In failed: ${serverMsg}`
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

  return (
    <>
      <BannerImage />
      <div className="flex items-center justify-center py-4">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-sm border p-4">
            <legend className="fieldset-legend text-xl italic">Sign In</legend>
            {error && <div className="text-red-500">{error}</div>}
            <label className="text-sm/6 font-medium text-white">Username</label>
            <input
              type="text"
              name="username"
              required
              className="input mb-1"
              placeholder="Username"
              autoComplete="off"
            />

            <label className="text-sm/6 font-medium text-white">Password</label>
            <input
              type="password"
              name="password"
              required
              className="input mb-1"
              placeholder="Password"
              autoComplete="off"
            />

            <div className="flex gap-4 justify-self-center">
              <button
                type="submit"
                className="btn btn-success mt-4"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
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
    </>
  );
};
