import { Routes, Route } from "react-router-dom";
import { SignUpPage } from "./pages/SignUpPage";
import { SignInPage } from "./pages/SignInPage";
import { Dashboard } from "./pages/Dashboard";
import { WorkoutListPage } from "./pages/WorkoutLIstPage";
import { WorkoutItem } from "./components/WorkoutItem";
import { NavBar } from "./components/NavBar";
import { WorkoutFormPage } from "./pages/WorkoutFormPage";
import { EditWorkoutPage } from "./pages/EditWorkoutPage";
import { ToastContainer } from "react-toastify";
import { UserListPage } from "./pages/UserListPage";
import { EditUserPage } from "./pages/EditUserPage";
import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { userAtom } from "./atoms/userAtom";
import { setupAxiosInterceptors } from "./services/axiosSetup";
import "./App.css";
import { UserWorkoutListPage } from "./pages/UserWorkoutListPage";
import { METValuesPage } from "./pages/METValues";

export const App = () => {
  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();
  // Informs the user when the token expires and will navigate them to the sign up page for a re-login
  useEffect(() => {
    setupAxiosInterceptors(() => {
      setUser(null);
      navigate("/sign-in");
    });
  }, [setUser, navigate]);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/metvalues" element={<METValuesPage />} />
        <Route path="/workouts" element={<WorkoutListPage />} />
        <Route
          path="/workouts/user/:userId"
          element={<UserWorkoutListPage />}
        />
        <Route path="/workouts/:workoutId" element={<WorkoutItem />} />
        <Route path="/workouts/new" element={<WorkoutFormPage />} />
        <Route path="/workouts/:workoutId/edit" element={<EditWorkoutPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/users/:userId/edit" element={<EditUserPage />} />
      </Routes>
      {/* Toastify Container for Visual Customization and Appearance in Browser */}
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};
