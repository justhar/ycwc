"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  redirectTo = "/auth",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "🛡️ ProtectedRoute: Auth state - loading:",
      loading,
      "user:",
      user
    );

    if (!loading && !user) {
      console.log(
        "🚪 ProtectedRoute: No user found, redirecting to:",
        redirectTo
      );
      router.push(redirectTo);
    } else if (!loading && user) {
      console.log("✅ ProtectedRoute: User authenticated:", user.email);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will redirect
  }

  return <>{children}</>;
}
