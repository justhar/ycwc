"use client";

import { useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";
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
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-2 font-medium bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
