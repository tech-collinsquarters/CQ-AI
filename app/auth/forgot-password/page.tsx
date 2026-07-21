"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { forgotPasswordRequest } from "@/lib/auth-client";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/validators/auth";

export default function ForgotPasswordPage() {
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email and we will send reset instructions if an account
            exists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submittedMessage ? (
            <Alert>
              <AlertTitle>Check your email</AlertTitle>
              <AlertDescription>{submittedMessage}</AlertDescription>
            </Alert>
          ) : null}

          {form.formState.errors.root ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to send reset email</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  const result = await forgotPasswordRequest(values);
                  setSubmittedMessage(result.message);
                  form.reset();
                } catch (error) {
                  form.setError("root", {
                    message:
                      error instanceof Error
                        ? error.message
                        : "Unable to send reset email",
                  });
                }
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Spinner />
                    Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link href="/auth/login" className="underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
