"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthFormState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

const initialState: AuthFormState = {};

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  const state = mode === "login" ? loginState : signUpState;

  return (
    <div>
      <div className="mb-6 flex rounded-[var(--radius-control)] border border-border bg-cream-soft p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-[calc(var(--radius-control)-2px)] py-2 transition-colors ${
            mode === "login" ? "bg-surface text-charcoal shadow-sm" : "text-charcoal-muted"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-[calc(var(--radius-control)-2px)] py-2 transition-colors ${
            mode === "signup" ? "bg-surface text-charcoal shadow-sm" : "text-charcoal-muted"
          }`}
        >
          Create account
        </button>
      </div>

      {state.message && (
        <p className="mb-4 rounded-[var(--radius-control)] bg-success-soft px-3 py-2 text-sm text-success">
          {state.message}
        </p>
      )}
      {state.error && (
        <p className="mb-4 rounded-[var(--radius-control)] bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      {mode === "login" ? (
        <form action={loginAction} className="space-y-4">
          <FormField label="Email" htmlFor="email" error={loginState.fieldErrors?.email}>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@bakery.com" />
          </FormField>
          <FormField label="Password" htmlFor="password" error={loginState.fieldErrors?.password}>
            <Input id="password" name="password" type="password" autoComplete="current-password" />
          </FormField>
          <Button type="submit" className="w-full" loading={loginPending}>
            Log in
          </Button>
        </form>
      ) : (
        <form action={signUpAction} className="space-y-4">
          <FormField
            label="Bakery name"
            htmlFor="businessName"
            error={signUpState.fieldErrors?.businessName}
          >
            <Input id="businessName" name="businessName" placeholder="Tulsi Bakes" />
          </FormField>
          <FormField label="Your name" htmlFor="fullName" error={signUpState.fieldErrors?.fullName}>
            <Input id="fullName" name="fullName" placeholder="Priya Sharma" />
          </FormField>
          <FormField label="Email" htmlFor="signup-email" error={signUpState.fieldErrors?.email}>
            <Input id="signup-email" name="email" type="email" autoComplete="email" placeholder="you@bakery.com" />
          </FormField>
          <FormField
            label="Password"
            htmlFor="signup-password"
            error={signUpState.fieldErrors?.password}
          >
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" className="w-full" loading={signUpPending}>
            Create account
          </Button>
        </form>
      )}
    </div>
  );
}