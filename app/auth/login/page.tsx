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
import { loginSchema, type LoginInput } from "@/validators/auth";

export default function LoginPage() {
  const { login, loading } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-4 sm:items-center sm:py-8">
      <Card className="w-full max-w-md border-border/70 shadow-md ring-1 ring-foreground/5">
        <CardHeader className="gap-1 pb-0">
          <CardTitle className="font-heading text-xl font-semibold tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription>
            Sign in to continue to Counsel.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {form.formState.errors.root ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to sign in</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          ) : null}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await login(values);
                } catch (error) {
                  form.setError("root", {
                    message:
                      error instanceof Error
                        ? error.message
                        : "Invalid credentials",
                  });
                }
              })}
              className="space-y-3.5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="gap-1.5">
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
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="h-9"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-1 w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          <span>No account?</span>
          <Link
            href="/auth/register"
            className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Create one
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
