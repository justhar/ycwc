"use client";

import React from "react";
import {
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TrackerPreview = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border shadow-sm overflow-hidden">
      {/* Header */}
      <header className="bg-card px-4 sm:px-6 py-4 border-b">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground">
              Application Tracker
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                className="bg-transparent border-none outline-none text-sm w-48"
                readOnly
              />
            </div>

            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Suggestions
            </Button>

            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {/* AI Recommendations Section */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-foreground">
                  AI Recommendations
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">
                      Prepare IELTS speaking test
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Practice speaking topics and improve fluency for better
                      scores
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                        NEED
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              All tasks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Task 1 */}
              <div className="p-4 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center flex-row">
                      <div className="flex items-start justify-between gap-2">
                        <button className="mt-1">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </button>
                        <h3 className="font-semibold text-foreground">
                          Submit application to MIT
                        </h3>
                      </div>
                      <button className="p-1 rounded hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete all required documents and submit online
                      application
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400">
                        MUST
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: Dec 15, 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task 2 */}
              <div className="p-4 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center flex-row">
                      <div className="flex items-start justify-between gap-2">
                        <button className="mt-1">
                          <Clock className="w-5 h-5 text-yellow-600" />
                        </button>
                        <h3 className="font-semibold text-foreground">
                          Prepare IELTS test materials
                        </h3>
                      </div>
                      <button className="p-1 rounded hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Study vocabulary and practice test questions
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400">
                        NEED
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: Nov 30, 2024
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task 3 */}
              <div className="p-4 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center flex-row">
                      <div className="flex items-start justify-between gap-2">
                        <button className="mt-1">
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        </button>
                        <h3 className="font-semibold text-foreground">
                          Research scholarship opportunities
                        </h3>
                      </div>
                      <button className="p-1 rounded hover:bg-muted">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Find and compare available scholarships for international
                      students
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400">
                        NICE
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: Jan 10, 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TrackerPreview;
