'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api-client';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['TENANT', 'LANDLORD']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'TENANT',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', data);

      if (res.status >= 200 && res.status < 300) {
        alert('Registration successful! Please login with your credentials.');
        router.push('/login');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (err: unknown ) {
      console.error('Registration error:', err);
      const errorMsg =
        typeof err === 'object' && err !== null
          ? ((err as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message ||
            (err as { message?: string }).message ||
            'Registration failed. Please try again.')
          : 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border shadow-sm mx-4">
      <CardHeader className="pb-4 pt-6 sm:pt-8">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Join RentNest as a Tenant or Landlord
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
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5">
                  <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="h-9 sm:h-10 text-sm sm:text-base" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5">
                  <FormLabel className="text-sm font-medium">I want to</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 sm:h-10 text-sm sm:text-base">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TENANT">Find a property (Tenant)</SelectItem>
                      <SelectItem value="LANDLORD">List a property (Landlord)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full h-9 sm:h-10 text-sm sm:text-base" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 pb-6 sm:pb-8">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}