'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { forgotPassword } from '../actions';

const initialState = {
    errors: {} as Record<string, string[]>,
    message: ''
};

export default function ForgotPasswordPage() {
    const t = useTranslations('Auth');
    // @ts-ignore
    const [state, formAction] = useActionState(forgotPassword, initialState);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {t('forgotPasswordTitle')}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        {t('forgotPasswordDesc')}
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                {t('emailAddress')}
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                placeholder={t('emailAddress')}
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <p className="text-green-600 text-sm mt-2 text-center">{state.message}</p>
                    )}

                    {state?.errors?.email && (
                        <p className="text-red-500 text-sm mt-2 text-center">{state.errors.email}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {t('sendResetLink')}
                        </button>
                    </div>
                    <div className="text-sm text-center">
                        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            {t('backToLogin')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
