'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { register } from '../actions';

interface RegisterState {
    errors?: Record<string, string[]>;
    message?: string;
}

const initialState: RegisterState = {
    errors: {},
    message: ''
};

export default function RegisterPage() {
    const t = useTranslations('Auth');
    const [state, formAction] = useActionState(register, initialState);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {t('registerTitle')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" action={formAction}>
                    <div className="-space-y-px rounded-md shadow-sm">
                        <div>
                            <label htmlFor="name" className="sr-only">
                                {t('fullName')}
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                placeholder={t('fullName')}
                            />
                        </div>
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
                                className="relative block w-full border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                placeholder={t('emailAddress')}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                {t('password')}
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                                placeholder={t('password')}
                            />
                        </div>
                    </div>

                    {state?.message && (
                        <div className="rounded-md bg-green-50 p-4 mb-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">
                                        {state.message}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    )}

                    {state?.errors && (
                        <div className="text-red-500 text-sm mt-2">
                            {Object.entries(state.errors).map(([key, errors]) => (
                                <p key={key}>{(errors as string[]).join(', ')}</p>
                            ))}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            {t('registerButton')}
                        </button>
                    </div>
                    <div className="text-sm text-center">
                        <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            {t('signInLink')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
