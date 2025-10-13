"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome,</h1>

        <div className="grid gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Profile
            </h2>
            <div className="space-y-2">
              <strong>ID:</strong> {user?.id}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Protected Content
            </h2>
            <p className="text-gray-600">
              This content is only visible to authenticated users. You have
              successfully logged in!
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
