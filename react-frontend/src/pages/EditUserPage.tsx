import { useEffect, useRef } from "react";
import { userAtom } from "../atoms/userAtom";
import { useAtom } from "jotai";
import { useParams } from "react-router";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router";
import type { UpdateUser } from "../types/user";
import { loadingAtom } from "../atoms/loadingAtom";
import { errorAtom } from "../atoms/errorAtom";
import { formValidityAtom } from "../atoms/formValidityAtom";
import { updateUser } from "../services/userService";
import { toast } from "react-toastify";

export const EditUserPage = () => {
  const { userId } = useParams();
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();
  const [loading, setLoading] = useAtom(loadingAtom);
  const [errorMsg, setErrorMsg] = useAtom(errorAtom);
  const formRef = useRef<HTMLFormElement>(null);
  const [isFormValid, setIsFormValid] = useAtom(formValidityAtom);

  const { isLoading, error, data } = useUser();

  // Removes the error message when navigating back to this page
  useEffect(() => {
    setErrorMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading)
    return (
      <div className="mt-6 flex justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (error) return "An error has occurred: " + error.message;

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData: UpdateUser = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      user_weight: Number(formData.get("weight")),
    };
    setLoading(true);
    try {
      const result = await updateUser(
        user?.token ?? "",
        Number(userId),
        userData
      );
      if (result && result.payload) {
        setUser({ ...result.payload, token: result.token });
        toast.success(
          `User Updated! Redirecting to ${user?.user_role === "admin" ? "Users" : "Dashboard"}...`
        );
        setErrorMsg(null);
        setTimeout(() => {
          navigate(user?.user_role === "admin" ? "/users" : "/");
        }, 500);
      }
    } catch (err) {
      setErrorMsg("Server Error: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = () => {
    if (formRef.current) {
      setIsFormValid(formRef.current.checkValidity());
    }
  };

  return (
    <>
      {user?.id !== Number(userId) && user?.user_role !== "admin" && (
        <div className="my-6 flex justify-center text-3xl italic">
          <h1>
            As you are not an admin, you are not allowed to edit another user's
            profile!
          </h1>
        </div>
      )}
      {(user?.user_role === "admin" ||
        (user?.id === Number(userId) && user?.user_role === "user")) && (
        <div className="flex items-center justify-center py-4">
          <form ref={formRef} onSubmit={handleUpdate} onInput={handleInput}>
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-sm border p-4">
              <legend className="fieldset-legend text-xl italic">
                Update User
              </legend>
              {errorMsg && <div className="text-red-500">{errorMsg}</div>}
              <label className="mb-1 text-sm/6 font-medium text-white">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  className="input validator mb-2"
                  required
                  defaultValue={data?.username}
                  pattern="[A-Za-z][A-Za-z0-9\-]*"
                  minLength={3}
                  maxLength={30}
                  title="Only letters, numbers or dash"
                />
                <p className="validator-hint">
                  Must be 3 to 30 characters
                  <br />
                  containing only letters, numbers or dash
                </p>
              </div>
              <label className="mb-1 text-sm/6 font-medium text-white">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  className="input validator mb-2"
                  required
                  defaultValue={data?.email}
                />
                <p className="validator-hint">Enter valid email address</p>
              </div>
              <label className="mb-1 text-sm/6 font-medium text-white">
                Body Weight (in KG, for Calculation of Calories Burned)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="weight"
                  className="input validator"
                  step={0.01}
                  min={0.01}
                  required
                  defaultValue={data?.user_weight}
                />
                <p className="validator-hint">Weight must be greater than 0</p>
              </div>
              <div className="flex gap-4 justify-self-center">
                <button
                  type="submit"
                  className="btn btn-success mt-4"
                  disabled={loading || !isFormValid}
                >
                  {loading ? "Updating User..." : "Update User"}
                </button>
                <button
                  type="button"
                  className="btn btn-soft mt-4"
                  onClick={() =>
                    navigate(user.user_role === "admin" ? "/users" : "/")
                  }
                >
                  Back
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      )}
    </>
  );
};
