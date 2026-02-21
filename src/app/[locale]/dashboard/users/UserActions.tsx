'use client';

import { approveUser, deleteUser } from "./actions";

interface UserActionsProps {
    userId: number;
    isApproved: boolean;
    isAdmin: boolean;
}

export default function UserActions({ userId, isApproved, isAdmin }: UserActionsProps) {
    return (
        <div className="flex gap-2">
            {!isApproved && (
                <form action={approveUser.bind(null, userId)}>
                    <button className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">
                        Approve
                    </button>
                </form>
            )}

            {!isAdmin && (
                <form
                    action={deleteUser.bind(null, userId)}
                    onSubmit={(e) => {
                        if (!confirm('Are you sure you want to delete this user?')) e.preventDefault();
                    }}
                >
                    <button className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">
                        Delete
                    </button>
                </form>
            )}
        </div>
    );
}
