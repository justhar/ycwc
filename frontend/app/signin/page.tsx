"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../../components/LoginForm";
import { Hamburger } from "lucide-react";
import Image from "next/image";

export default function SignInPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/profile");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
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
            <Image
              src="/logo.svg"
              alt="Abroadly Logo"
              width={40}
              priority
              fetchPriority="high"
              height={40}
              className="mx-auto h-10 w-10 text-foreground dark:text-foreground"
            />
            <h3 className="mt-2 text-center text-lg font-semibold text-foreground dark:text-foreground">
              Sign in to your account
            </h3>
          </div>

          <LoginForm onSuccess={() => router.push("/profile")} />
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/signup" className="text-orange-600 hover:text-orange-500">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
