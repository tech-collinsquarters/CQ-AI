"use client";

import Link from "next/link";
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
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/validators/auth";

export default function RegisterPage() {
  const { register, loading } = useAuth();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-3 sm:items-center sm:py-6">
      <Card className="w-full max-w-md border-border/70 shadow-md ring-1 ring-foreground/5">
        <CardHeader className="gap-1 pb-0">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Create account
          </CardTitle>
          <CardDescription>
            Start your private legal workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pt-3">
          {form.formState.errors.root ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to register</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await register(values);
                } catch (error) {
                  form.setError("root", {
                    message:
                      error instanceof Error
                        ? error.message
                        : "Unable to register",
                  });
                }
              })}
              className="space-y-3"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="gap-1.5 sm:col-span-2">
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete="name"
                          placeholder="Your full name"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="gap-1.5 sm:col-span-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="gap-1.5">
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Min. 12 characters"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="gap-1.5">
                      <FormLabel>Confirm</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          className="h-9"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner />
                    Creating account…
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <Link
            href="/auth/login"
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
