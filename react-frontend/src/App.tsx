import { Routes, Route } from "react-router-dom";
import { SignUpPage } from "./pages/SignUpPage";
import { SignInPage } from "./pages/SignInPage";
import { Dashboard } from "./pages/Dashboard";
import { WorkoutListPage } from "./pages/WorkoutLIstPage";
import { WorkoutItem } from "./components/WorkoutItem";
import { NavBar } from "./components/NavBar";
import { AddWorkoutPage } from "./pages/AddWorkoutPage";
import { EditWorkoutPage } from "./pages/EditWorkoutPage";
import { ToastContainer } from "react-toastify";
import "./App.css";

export const App = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sign-up" element={<SignUpPage />}/>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/workouts" element={<WorkoutListPage />}>
          <Route path="/:workoutId" element={<WorkoutItem />} />
          <Route path="/new" element={<AddWorkoutPage />} />
          <Route path="/:workoutId/edit" element={<EditWorkoutPage />} />
        </Route>
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
