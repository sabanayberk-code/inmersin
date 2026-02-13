
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { approveUser, deleteUser } from "../actions";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);

    // We can add simple form actions here for buttons

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Approved</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium">{user.id}</td>
                                <td className="px-6 py-4">{user.name}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.role}</td>
                                <td className="px-6 py-4">
                                    {user.emailVerified ? (
                                        <span className="text-green-600 font-semibold">Verified</span>
                                    ) : (
                                        <span className="text-amber-600">Unverified</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {user.isApproved ? (
                                        <span className="text-green-600 font-semibold">Yes</span>
                                    ) : (
                                        <span className="text-red-500 font-bold">No</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex gap-2">
                                    {!user.isApproved && (
                                        <form action={approveUser.bind(null, user.id)}>
                                            <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                                                Approve
                                            </button>
                                        </form>
                                    )}

                                    {user.role !== 'admin' && (
                                        <form action={deleteUser.bind(null, user.id)}
                                            onSubmit={(e) => {
                                                if (!confirm('Are you sure you want to delete this user?')) e.preventDefault();
                                            }}
                                        >
                                            <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                                                Delete
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
