"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const result = signupSchema.safeParse({ email, password });
    if (!result.success) {
      const errs = result.error.flatten().fieldErrors;
      setFieldErrors({ email: errs.email?.[0], password: errs.password?.[0] });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
    });
    setLoading(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold text-text-primary">
          Check your email
        </h1>
        <p className="text-sm text-text-secondary">
          We sent a confirmation link to{" "}
          <span className="text-text-primary">{email}</span>. Click it to
          activate your account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Create account
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Already have one?{" "}
          <Link
            href="/login"
            className="text-accent-muted hover:text-accent underline-offset-4 hover:underline transition-colors duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm text-text-secondary">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="bg-surface border-border text-text-primary placeholder:text-text-disabled focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:ring-offset-0"
          />
          {fieldErrors.email && (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="text-sm text-text-secondary">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            className="bg-surface border-border text-text-primary placeholder:text-text-disabled focus-visible:ring-1 focus-visible:ring-border-strong focus-visible:ring-offset-0"
          />
          {fieldErrors.password && (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="text-sm text-destructive">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-background hover:bg-accent-muted transition-colors duration-150"
        >
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
