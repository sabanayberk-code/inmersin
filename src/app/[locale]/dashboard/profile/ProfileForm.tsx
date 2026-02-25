'use client';

import { useActionState } from 'react';
import { updateProfile } from './actions';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string | null; companyName: string | null } }) {
    const [state, action, isPending] = useActionState(updateProfile, null); // Use undefined or null as initial state
    const t = useTranslations('Profile');

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
                <label className="block text-sm font-medium mb-1">{t('emailLabel')}</label>
                <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">{t('emailCannotBeChanged')}</p>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('fullName')}</label>
                <input
                    name="name"
                    defaultValue={user.name}
                    required
                    className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
                {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('phoneLabel')}</label>
                <input
                    name="phone"
                    defaultValue={user.phone || ''}
                    placeholder="+90 555 555 55 55"
                    className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
                {state?.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('companyName')}</label>
                <input
                    name="companyName"
                    defaultValue={user.companyName || ''}
                    placeholder={t('companyNamePlaceholder')}
                    className="w-full p-2 border rounded text-black dark:text-white dark:bg-gray-700 dark:border-gray-600"
                />
                {state?.errors?.companyName && <p className="text-red-500 text-xs mt-1">{state.errors.companyName[0]}</p>}
            </div>
            <Button type="submit" disabled={isPending}>
                {isPending ? t('updating') : t('updateProfile')}
            </Button>
        </form>
    );
}
