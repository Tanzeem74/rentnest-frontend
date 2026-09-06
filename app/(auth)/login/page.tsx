"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api-client";
import { UserRole } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);

    try {
      const payload = {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      };

      const res = await api.post("/auth/login", payload);
      const responseData = res.data?.data;

      if (!responseData?.accessToken) {
        toast.error("Invalid response format from server");
        return;
      }

      const token = responseData.accessToken;
      const refreshToken = responseData.refreshToken;

      let userId = "";
      let userRole: UserRole = "TENANT";
      let userEmail = payload.email;
      let userName = "User";

      try {
        const parts = token.split(".");

        if (parts.length === 3) {
          const payloadBase64 = parts[1];

          const normalizedPayload = payloadBase64
            .replace(/-/g, "+")
            .replace(/_/g, "/");

          const decodedPayload = JSON.parse(atob(normalizedPayload));

          userId = decodedPayload.userId || "";

          const roleFromToken =
            decodedPayload.role || decodedPayload.userRole || "TENANT";

          if (
            roleFromToken === "TENANT" ||
            roleFromToken === "LANDLORD" ||
            roleFromToken === "ADMIN"
          ) {
            userRole = roleFromToken;
          }

          userEmail = decodedPayload.email || payload.email;

          userName = decodedPayload.name || decodedPayload.userName || "User";
        }
      } catch (decodeErr) {
        console.warn("Token decode failed:", decodeErr);
      }

      login({
        accessToken: token,
        refreshToken,
        user: {
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole,
        },
      });
    } catch (err) {
      let errorMessage = "Invalid credentials";

      if (err && typeof err === "object" && "response" in err) {
        const errorResponse = err as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        errorMessage = errorResponse.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-4 w-full max-w-md border shadow-sm">
      <CardHeader className="pb-4 pt-6 sm:pt-8">
        <CardTitle className="text-center text-xl font-bold sm:text-2xl">
          Welcome back
        </CardTitle>

        <CardDescription className="text-center text-sm sm:text-base">
          Sign in to your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-1.5">
                  <FormLabel className="text-sm font-medium">Email</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="you@example.com"
                      className="h-9 text-sm sm:h-10 sm:text-base"
                      {...field}
                    />
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
                  <FormLabel className="text-sm font-medium">
                    Password
                  </FormLabel>

                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-9 text-sm sm:h-10 sm:text-base"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-9 w-full text-sm sm:h-10 sm:text-base"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex justify-center pb-6 pt-2 sm:pb-8">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
