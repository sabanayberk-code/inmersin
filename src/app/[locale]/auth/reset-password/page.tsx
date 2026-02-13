'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter, usePathname } from '@/i18n/routing';
import { resetPassword } from '../actions';
import { useSearchParams } from 'next/navigation';

const initialState = {
    errors: {} as Record<string, string[]>,
    success: false
};

export default function ResetPasswordPage() {
    const t = useTranslations('Auth');
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    // @ts-ignore
    const [state, formAction] = useActionState(resetPassword, initialState);

    if (state?.success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Password Reset Successful</h2>
                    <p className="mb-6 text-gray-600 dark:text-gray-300">Your password has been successfully updated.</p>
                    <Link href="/auth/login" className="inline-block w-full text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                        {t('signInButton')}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {t('resetPasswordTitle')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" action={formAction}>
                    <input type="hidden" name="token" value={token} />
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="password" className="sr-only">
                                {t('newPassword')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                placeholder={t('newPassword')}
                            />
                        </div>
                    </div>

                    {state?.errors?.token && (
                        <p className="text-red-500 text-sm mt-2 text-center">{state.errors.token}</p>
                    )}
                    {state?.errors?.password && (
                        <p className="text-red-500 text-sm mt-2 text-center">{state.errors.password}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {t('resetPasswordButton')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
