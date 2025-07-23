import { BannerImage } from "../components/BannerImage";
import { useNavigate } from "react-router";
import { useWorkoutMetadata } from "../hooks/useWorkoutMetadata";

export const METValuesPage = () => {
  const navigate = useNavigate();
  const { isLoading, error, data } = useWorkoutMetadata();

  if (isLoading)
    return (
      <div className="mt-6 flex justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (error)
    return (
      <h1 className="mt-6 text-center text-3xl italic">
        An error has occurred: {error.message}
      </h1>
    );

  return (
    <>
      <BannerImage />
      <div className="my-6 flex flex-col items-center justify-self-center text-4xl font-bold italic">
        <h1>Workout Metabolic Equivalent of Task (MET) Values</h1>
        <h1 className="mt-4 flex flex-col items-center gap-2 justify-self-center text-2xl">
          Calculation of Calories Burned: <br />
          <span className="font-normal">
            MET Value * Body Weight (kg) * Duration (hours)
          </span>
        </h1>
      </div>
      <div className="flex justify-center overflow-x-auto">
        <table className="border-base-300 table w-1/4 border">
          {/* head */}
          <thead className="bg-base-200">
            <tr className="text-center">
              <th>Workout Name</th>
              <th>Category Name</th>
              <th>MET Value</th>
            </tr>
          </thead>
          <tbody>
            {data
              ?.slice()
              .sort((a, b) => a.category_name.localeCompare(b.category_name))
              .map((w) => (
                <tr className="text-center" key={w.id}>
                  <th>{w.workout_name}</th>
                  <td>{w.category_name}</td>
                  <td>{w.met_value}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="my-4 flex flex-col items-center gap-4 justify-self-center">
        <button
          className="btn btn-soft"
          type="button"
          onClick={() => navigate("/")}
        >
          Back
        </button>
        <p className="text-xl italic">
          Sourced from:{" "}
          <a
            className="link link-accent"
            href="https://en.wikipedia.org/wiki/Metabolic_equivalent_of_task"
            target="_blank"
          >
            Wikipedia
          </a>
        </p>
      </div>
    </>
  );
};
