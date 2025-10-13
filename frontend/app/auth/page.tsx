"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { Download, Hamburger } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return null; // Router will redirect
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className=" flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Hamburger
              className="mx-auto h-10 w-10 text-foreground dark:text-foreground"
              aria-hidden={true}
            />
            <h3 className="mt-2 text-center text-lg font-bold text-foreground dark:text-foreground">
              {isLogin ? "Sign in to your account" : "Create new account"}
            </h3>
          </div>

          {isLogin ? (
            <LoginForm
              onSuccess={() => router.push("/profile")}
              onSwitchToRegister={() => setIsLogin(false)}
            />
          ) : (
            <RegisterForm
              onSuccess={() => router.push("/profile")}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
