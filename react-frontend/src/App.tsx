import { Routes, Route } from "react-router-dom";
import { SignUpPage } from "./pages/SignUpPage";
import { SignInPage } from "./pages/SignInPage";
import { Dashboard } from "./pages/Dashboard";
import { WorkoutListPage } from "./pages/WorkoutLIstPage";
import { WorkoutItem } from "./components/WorkoutItem";
import { NavBar } from "./components/NavBar";
import { AddWorkoutPage } from "./pages/AddWorkoutPage";
import { EditWorkoutPage } from "./pages/EditWorkoutPage";
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
          <Route path="/:id" element={<WorkoutItem />} />
          <Route path="/new" element={<AddWorkoutPage />} />
          <Route path="/:id/edit" element={<EditWorkoutPage />} />
        </Route>
      </Routes>
    </>
  );
};
