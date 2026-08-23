'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', data);
            login(res.data);
        } catch (err: unknown) {
            if (typeof err === 'object' && err !== null && 'response' in err) {
                setError((err as { response: { data: { message: string } } }).response.data.message || 'Invalid credentials');
            } else {
                setError('Invalid credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md border shadow-sm mx-4">
            <CardHeader className="pb-4 pt-6 sm:pt-8">
                <CardTitle className="text-xl sm:text-2xl font-bold text-center">Welcome back</CardTitle>
                <CardDescription className="text-center text-sm sm:text-base">
                    Sign in to your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
                        {error && (
                            <div className="p-2 sm:p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md">
                                {error}
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="space-y-1 sm:space-y-1.5">
                                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="you@example.com" className="h-9 sm:h-10 text-sm sm:text-base" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="space-y-1 sm:space-y-1.5">
                                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" className="h-9 sm:h-10 text-sm sm:text-base" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full h-9 sm:h-10 text-sm sm:text-base" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6 sm:pb-8">
                <p className="text-sm text-gray-500">
                    Don&rsquo;t have an account?{' '}
                    <Link href="/register" className="text-blue-600 hover:underline font-medium">
                        Create one
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}