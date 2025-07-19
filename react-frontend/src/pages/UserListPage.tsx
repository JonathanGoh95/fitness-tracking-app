import { userAtom } from "../atoms/userAtom";
import { useUsers } from "../hooks/useUsers";
import { deleteUser } from "../services/userService";
import { useAtom, useAtomValue } from "jotai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdAtom } from "../atoms/deleteIdAtom";
import { useNavigate } from "react-router-dom";
import { BannerImage } from "../components/BannerImage";

export const UserListPage = () => {
  const user = useAtomValue(userAtom);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useAtom(deleteIdAtom);

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => {
      if (!user || !user.token || user.user_role !== "admin") {
        return Promise.reject(new Error("User not authenticated"));
      }
      return deleteUser(user.token, userId);
    },
    onSuccess: () => {
      // Refetch users after deletion
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const { isLoading, error, data } = useUsers(user?.token);
  console.log(data)
  if (isLoading)
    return (
      <div className="mt-6 flex justify-center">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );

  if (error) return (<h1 className="mt-6 text-center text-3xl italic">An error has occurred: {error.message}</h1>)

  const openDeleteModal = (id: number) => setDeleteId(id);
  const closeDeleteModal = () => setDeleteId(null);

  const handleEdit = (userId: number) => {
    navigate(`${userId}/edit`);
  };

  const handleDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      closeDeleteModal();
    }
  };

  return (
    <>
      <BannerImage />
      {user && user.user_role === "admin" ? (
        <div className="mx-auto max-w-6xl p-6">
          <div className="mb-6 flex flex-col items-center justify-self-center italic">
            <h1 className="mb-4 text-3xl font-bold">
              Welcome, Admin {user.username}
            </h1>
            <p className="text-xl text-gray-400">Manage user accounts below:</p>
          </div>
          {data?.length !== 0 ? (
            <div className="overflow-x-auto">
              <table className="border-base-300 table w-full border">
                <thead className="bg-base-200">
                  <tr className="text-center">
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>User Weight</th>
                    <th>User Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((u) => (
                    <tr key={u.id} className="text-center hover:bg-base-100">
                      <td>{u.id}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.user_weight}</td>
                      <td>{u.user_role}</td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleEdit(u.id)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-error btn-sm"
                            onClick={() => openDeleteModal(u.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-2 flex justify-center gap-4">
                  <button
                  className="btn btn-soft"
                  type="button"
                  onClick={() => navigate("/")}
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <h2 className="mt-8 text-center text-xl">No Users Found.</h2>
          )}
          <dialog className="modal" open={deleteId !== null} onClick={(e) => {
              // Only close if the user clicks the backdrop, not the modal content
              if (e.target === e.currentTarget) {
                closeDeleteModal();
              }
            }}>
            <div className="modal-box">
              <h3 className="text-lg font-bold">Confirm User Deletion</h3>
              <p className="py-4">
                This action cannot be undone. Are you sure you want to continue?
              </p>
              <form
                method="dialog"
                className="modal-action mt-4 flex justify-center gap-2"
              >
                <button
                  className="btn btn-error"
                  type="button"
                  onClick={handleDelete}
                >
                  Delete User
                </button>
                <button
                  className="btn btn-neutral"
                  type="button"
                  onClick={closeDeleteModal}
                >
                  Close
                </button>
              </form>
            </div>
          </dialog>
        </div>
      ) : (
        <h1 className="mt-6 text-center text-3xl italic">
          You are not authorised to view the list of users!
        </h1>
      )}
    </>
  );
};
