"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({
  onSuccess,
  onSwitchToLogin,
}: RegisterFormProps) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullname.trim()) {
      setError("Full name is required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    const result = await register(fullname, email, password);

    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.error || "Registration failed");
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
              Full Name
            </Label>
            <Input
              id="fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              className="mt-2"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground dark:text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground dark:text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2"
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-foreground dark:text-foreground">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-2"
              placeholder="Confirm your password"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-2 font-medium"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          {onSwitchToLogin && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-zinc-600 hover:text-zinc-900 hover:cursor-pointer font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
