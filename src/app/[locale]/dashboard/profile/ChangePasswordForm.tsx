'use client';

import { useActionState } from 'react';
import { changePassword } from './actions';
import { Button } from '@/components/ui/button';

export function ChangePasswordForm() {
    const [state, action, isPending] = useActionState(changePassword, null);

    return (
        <form action={action} className="space-y-4">
            {state?.success && (
                <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
                    {state.message}
                </div>
            )}

            {state?.error && (
                <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                    {state.error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Current Password</label>
                <input
                    type="password"
                    name="currentPassword"
                    required
                    className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
                {state?.errors?.currentPassword && <p className="text-red-500 text-xs mt-1">{state.errors.currentPassword[0]}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New Password</label>
                <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={6}
                    className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
                {state?.errors?.newPassword && <p className="text-red-500 text-xs mt-1">{state.errors.newPassword[0]}</p>}
            </div>
            <Button type="submit" variant="outline" disabled={isPending}>
                {isPending ? 'Changing...' : 'Change Password'}
            </Button>
        </form>
    );
}
