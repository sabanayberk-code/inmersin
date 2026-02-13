'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { login } from '../actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const initialState = {
    errors: {} as Record<string, string[]>,
};

export default function LoginPage() {
    const t = useTranslations('Auth');
    const [state, formAction] = useActionState(login, initialState);

    return (
        <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 lg:min-h-screen xl:min-h-[800px]">
            <div className="hidden bg-muted lg:block relative h-full">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium p-10 text-white">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-6 w-6"
                    >
                        <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                    </svg>
                    Inmersin
                </div>
                <div className="relative z-20 mt-auto p-10 text-white">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold leading-tight">
                            {t('quote')}
                        </h1>
                        <p className="text-lg opacity-80">{t('team')}</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <Card className="border-0 shadow-none sm:border sm:shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('signInTitle')}</CardTitle>
                            <CardDescription>
                                {t('loginDescription')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={formAction}>
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">{t('emailAddress')}</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            required
                                        />
                                        {state?.errors?.email && (
                                            <p className="text-sm font-medium text-destructive text-red-500">{state.errors.email}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <div className="flex items-center">
                                            <Label htmlFor="password">{t('password')}</Label>
                                            <Link href="/auth/forgot-password" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                                                {t('forgotPasswordLink')}
                                            </Link>
                                        </div>
                                        <Input id="password" type="password" name="password" required />
                                    </div>
                                    <Button type="submit" className="w-full">
                                        {t('signInButton')}
                                    </Button>
                                    {/* <button className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
                                        {t('signInButton')}
                                    </button> */}
                                </div>
                            </form>
                            <div className="mt-4 text-center text-sm">
                                <Link href="/auth/register" className="underline text-muted-foreground hover:text-primary">
                                    {t('registerLink')}
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
