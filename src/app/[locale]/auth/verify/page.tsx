'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '../actions';
import { Link } from '@/i18n/routing';

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }

        verifyEmail(token).then((result) => {
            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        });
    }, [token]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow">
                <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Email Verification
                </h2>

                <div className="text-center">
                    {status === 'loading' && <p>Verifying your email...</p>}
                    {status === 'success' && (
                        <div className="space-y-4">
                            <p className="text-green-600 font-medium">Your email has been successfully verified!</p>
                            <Link href="/auth/login" className="inline-block w-full text-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
                                Proceed to Login
                            </Link>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="space-y-4">
                            <p className="text-red-600 font-medium">Invalid or expired verification token.</p>
                            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
                                Back to Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
