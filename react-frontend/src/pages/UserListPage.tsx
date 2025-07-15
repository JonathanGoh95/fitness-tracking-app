import { userAtom } from "../atoms/userAtom"
import { useUsers } from "../hooks/useUsers"
import { deleteUser } from "../services/userService";
import { useAtom, useAtomValue } from "jotai"
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdAtom } from "../atoms/deleteIdAtom";
import type { FC } from "react"
import { useNavigate } from "react-router-dom";

export const UserListPage: FC = () => {
    const user = useAtomValue(userAtom)
    const queryClient = useQueryClient();
    const navigate = useNavigate()
    const [deleteId, setDeleteId] = useAtom(deleteIdAtom);

    const deleteMutation = useMutation({
    mutationFn: (userId: number) => {
      if (!user || !user.token || user.user_role !== 'admin') {
        return Promise.reject(new Error("User not authenticated"));
      }
      return deleteUser(user.token, userId);
    },
    onSuccess: () => {
      // Refetch users after deletion
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    });

    const { isLoading, error, data } = useUsers()

    if (isLoading) return <span className="loading loading-spinner loading-xl"></span>

    if (error) return 'An error has occurred: ' + error.message

    const openDeleteModal = (id: number) => setDeleteId(id);
    const closeDeleteModal = () => setDeleteId(null);

    const handleEdit = (userId:number) => {
    navigate(`users/${userId}/edit`)
  }

    const handleDelete = () => {
        if (deleteId !== null) {
        deleteMutation.mutate(deleteId);
        closeDeleteModal();
        }
    }

    return (<>
    {user && user.user_role === 'admin' ? (
    <>
    <h1>Welcome, Admin {user.username}</h1>
    {data?.length !== 0 ? (
    <div className="overflow-x-auto">
        <table className="table">
        {/* head */}
        <thead>
        <tr>
            <th>User ID</th>
            <th>Username</th>
            <th>Email Address</th>
            <th>User Weight</th>
            <th>User Role</th>
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {data?.map((u)=>(
        <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.username}</td>
            <td>{u.email}</td>
            <td>{u.user_weight}</td>
            <td>{u.user_role}</td>
            <td>
                <div className="flex gap-4">
                <button className="btn btn-warning mt-4" onClick={() => handleEdit(u.id)}>Edit</button>
                <button className="btn btn-error mt-4" onClick={() => openDeleteModal(u.id)}>Delete</button>
                </div>
            </td>
        </tr>
        ))}
        </tbody>
        </table>
    </div>) : 
    (
        <h2>No Users Found.</h2>
    )}
    <dialog className="modal" open={deleteId !== null}>
        <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm User Deletion</h3>
            <p className="py-4">This action cannot be undone. Are you sure you want to continue?</p>
        </div>
        <form method="dialog" className="modal-action flex justify-center gap-2">
            <button className="btn btn-error" type="button" onClick={handleDelete}>Delete User</button>
            <button className="btn btn-neutral" type="button" onClick={closeDeleteModal}>Close</button>
        </form>
    </dialog>
    </>
    ) : (
    <h1>You are not authorised to view the list of users!</h1>
    )}
    </>
    )
}