import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";

const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export default function NewPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: NewPasswordFormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: data.password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update password");
      }

      setSuccessMessage(result.message);
      form.reset();

      // Redirect to login page after successful password update
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 2000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {successMessage && (
        <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="mb-4 bg-red-50 text-red-900 border-red-200">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your new password" {...field} />
                </FormControl>
                <FormMessage />
                <p className="text-sm text-gray-900 dark:text-gray-400">
                  Password must be at least 8 characters long, include an uppercase letter, a number, and a special
                  character.
                </p>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your new password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-gray-900 text-gray-50 hover:bg-gray-800" disabled={isLoading}>
            {isLoading ? "Updating..." : "Set New Password"}
          </Button>
        </form>
      </Form>
    </>
  );
}
