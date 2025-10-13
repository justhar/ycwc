"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  return (
    <Card className="shadow-none mt-4 sm:mx-auto sm:w-full sm:max-w-md">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <Label className="text-sm font-medium text-foreground dark:text-foreground">
              Email
            </Label>
            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="haroki@haroki.com"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground dark:text-foreground">
              Password
            </Label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="password"
              placeholder="Password"
              className="mt-2"
              required
            />
          </div>

          <Button
            disabled={isLoading}
            type="submit"
            className="mt-4 w-full py-2 font-medium"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          {onSwitchToRegister && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="text-zinc-600 hover:text-zinc-900 hover:cursor-pointer font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {/* <p className="text-center text-xs text-muted-foreground dark:text-muted-foreground">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="capitalize text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
            >
              Terms of use
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="capitalize text-primary hover:text-primary/90 dark:text-primary hover:dark:text-primary/90"
            >
              Privacy policy
            </a>
          </p> */}
        </form>
      </CardContent>
    </Card>
  );
}
