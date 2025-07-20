import { useAtomValue, useAtom } from "jotai";
import { userAtom } from "../atoms/userAtom";
import { selectedUserAtom } from "../atoms/selectedUserAtom";
import { useNavigate } from "react-router";
import { BannerImage } from "../components/BannerImage";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LineChart, Line } from "recharts";
import { useAllWorkouts } from "../hooks/useAllWorkouts"; // useWorkouts hook for fetching Workouts data for logged-in user
import { useUsers } from "../hooks/useUsers";
import type { TooltipContentProps } from "recharts";

export const Dashboard = () => {
  const user = useAtomValue(userAtom);
  const navigate = useNavigate();
  const { data: workouts } = useAllWorkouts();
  const { data: users } = useUsers(user?.token); // Fetch all users
  const [selectedUserId, setSelectedUserId] = useAtom(selectedUserAtom)

  // For admins: filter workouts by selected user, otherwise by logged-in user
  const filteredWorkouts = Array.isArray(workouts)
  ? workouts.filter(w =>
      user?.user_role === "admin"
        ? selectedUserId
          ? w.user_id === selectedUserId
          : true // Show all if none selected
        : w.user_id === user?.id
    )
  : [];
  console.log(filteredWorkouts)

  // Filter workouts for the current user if needed
  const chartData = filteredWorkouts.map(w => ({
    calories: w.calories_burned,
    duration: w.duration_mins,
    date: w.workout_date,
    workout_type: w.workout_type,
  })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort according to date and time in ascending order


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: TooltipContentProps<any,any>) => {
  if (active && payload && payload.length) {
    const workout = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded shadow text-black text-xl">
        <div><strong>{workout.workout_type}</strong></div>
        <div>Calories: {workout.calories}</div>
        <div>Duration: {workout.duration} mins</div>
        <div>Date: {new Date(workout.date).toLocaleDateString()}</div>
      </div>
    );
  }
  return null;
};

  return (
    <>
      <BannerImage />
      {user && (user.user_role === "user" || user.user_role === "admin") ? (
        <div className="flex min-h-[40vh] flex-col items-center gap-4 justify-self-center text-4xl italic">
          <h1>
            Welcome Back, {user.user_role === "admin" ? `, Admin` : ""} {user.username}!
          </h1>
          <p>
            {user.user_role === "admin"
              ? "Create additional admin accounts, view/edit user accounts, or view individual user's workout data below!"
              : "Here is an overview of your latest activities:"}
          </p>
          {/* Admin dropdown box*/}
          {user.user_role === "admin" && Array.isArray(users) && (
            <div className="flex justify-center gap-2 mt-2">
              <label className="mt-1 text-xl w-70">Select User/Admin:</label>
              <select
                className="select"
                value={selectedUserId ?? ""}
                onChange={e =>
                  setSelectedUserId(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">All Users</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username}{u.user_role==='admin'? " (Admin)" : "(User)"}
                  </option>
                ))}
              </select>
            </div>
          )}
          {chartData.length > 0 ? (
            <div className="flex flex-col md:flex-row gap-10 w-full justify-center min-w-600">
            {/* ScatterChart */}
            <div style={{ width: "100%", maxWidth: 600, height: 400 }}>
              <ResponsiveContainer className="text-xl">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis type="number" dataKey="duration" name="Duration" unit="mins" />
                  <YAxis type="number" dataKey="calories" name="Calories Burned" unit="kcal" />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Workout" data={chartData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            {/* LineChart */}
            <div style={{ width: "100%", maxWidth: 600, height: 400 }}>
              <ResponsiveContainer className="text-xl">
                <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    name="Date"
                    tickFormatter={date =>
                      new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    }
                    minTickGap={20}
                  />
                  <YAxis yAxisId="left" dataKey="calories" name="Calories Burned" unit="kcal" />
                  <YAxis yAxisId="right" orientation="right" dataKey="duration" name="Duration" unit="mins" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="calories" name="Calories Burned" stroke="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="duration" name="Duration" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            </div>
          ) : (
            <div className="my-6 flex justify-center text-3xl italic">
              <h1>No workout data found{user.user_role === "admin" && selectedUserId && users
                ? ` for ${users.find(u => u.id === selectedUserId)?.username || ""}`
                : ` for ${user.username}`}!</h1>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="my-6 flex justify-center text-3xl italic">
            <h1>
              Start Tracking your Fitness Journey and Monitor your Progress
              easily!
            </h1>
          </div>
          <div className="flex justify-center gap-4">
            <button
              className="btn btn-soft mt-4 text-lg italic"
              onClick={() => navigate("/sign-up")}
            >
              Sign Up
            </button>
            <button
              className="btn btn-soft mt-4 text-lg italic"
              onClick={() => navigate("/sign-in")}
            >
              Sign In
            </button>
          </div>
        </>
      )}
    </>
  );
};
