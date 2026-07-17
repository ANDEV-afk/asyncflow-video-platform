"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignInInput, signInSchema } from "@/lib/validations/auth";

export default function SignInPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const rawData = {
        email: formData.get("email"),
        password: formData.get("password"),
      };

      const parsed = signInSchema.safeParse(rawData);
      if (!parsed.success) {
        setError(parsed.error.issues[0].message);
        return;
      }

      const data: SignInInput = parsed.data;
      const res = await signIn.email({
        email: data.email,
        password: data.password,
      });

      if (res.error) {
        setError(res.error.message ?? "Something went wrong");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-violet-700 to-sky-700 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold backdrop-blur-sm">
            A
          </div>
          <span className="text-xl font-bold">AsyncFlow</span>
        </Link>
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm">
            <Sparkles className="size-4" />
            Async collaboration
          </div>
          <h2 className="text-3xl font-bold leading-tight">
            Welcome back.
            <br />
            Your team is waiting.
          </h2>
          <p className="mt-4 max-w-md text-violet-100">
            Pick up where you left off — review recordings, respond to comments,
            and stay in sync without another meeting.
          </p>
        </div>
        <p className="relative text-sm text-violet-200">
          © AsyncFlow — Record once, collaborate forever.
        </p>
      </div>

      <div className="flex items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md border-0 bg-card/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-2 text-center">
            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 lg:hidden"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-sky-500 text-sm font-bold text-white">
                A
              </div>
              <span className="font-bold">AsyncFlow</span>
            </Link>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Sign in
            </CardTitle>
            <CardDescription>
              Enter your email and password to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="flex flex-col gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4 pt-2">
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-gradient-to-r from-violet-600 to-violet-500 font-medium"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-medium text-violet-600 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
