"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { GraduationCap, Star, Sparkles } from "lucide-react";
import Link from "next/link";
import UnivCard from "@/components/UnivCard";
import ScholarshipCard from "@/components/ScholarshipCard";
import type { University, Favorite, ScholarshipFavorite } from "@/types";

interface FavoritesPanelProps {
  favorites: Favorite[];
  scholarshipFavorites: ScholarshipFavorite[];
  favoritesLoading: boolean;
  scholarshipFavoritesLoading: boolean;
  savedItems: string[];
  token?: string;
  onToggleSaved: (id: string) => Promise<void>;
  onToggleScholarshipSaved: (scholarshipId: string) => Promise<void>;
  onSelectUniversity?: (university: University) => void;
  t: (key: string) => string;
}

export function FavoritesPanel({
  favorites,
  scholarshipFavorites,
  favoritesLoading,
  scholarshipFavoritesLoading,
  savedItems,
  token,
  onToggleSaved,
  onToggleScholarshipSaved,
  onSelectUniversity,
  t,
}: FavoritesPanelProps) {
  return (
    <div className="border rounded-lg p-4 my-5 md:mr-4">
      <h2 className="font-semibold text-2xl flex flex-row items-center gap-2">
        <Star className="text-yellow-400 " /> {t("myFavorites")}
      </h2>
      <Separator className="my-2" />

      <Tabs defaultValue="universities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="universities" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            {t("universities")} ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            {t("scholarships")} ({scholarshipFavorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="universities" className="mt-4">
          {favoritesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">
                {t("loadingUniversities")}
              </span>
            </div>
          ) : favorites.length > 0 ? (
            <div className="gap-4 flex flex-col">
              {favorites.map((favorite) => (
                <UnivCard
                  key={favorite.university.id}
                  university={favorite.university as any}
                  savedItems={savedItems}
                  onToggleSaved={onToggleSaved}
                  onSelectUniversity={onSelectUniversity as any}
                  userToken={token}
                />
              ))}
            </div>
          ) : (
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <GraduationCap />
                </EmptyMedia>
                <EmptyTitle>{t("noFavoriteUniversities")}</EmptyTitle>
                <EmptyDescription>
                  {t("addFavoriteUniversities")}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/match">
                  <Button className="text-zinc-900 hover:bg-transparent cursor-pointer hover:shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    {t("matchWithAI")} <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-zinc-500">atau</p>
                <Link href="/search">
                  <Button variant="outline" size="sm">
                    {t("searchUniversities")}
                  </Button>
                </Link>
              </EmptyContent>
            </Empty>
          )}
        </TabsContent>

        <TabsContent value="scholarships" className="mt-4">
          {scholarshipFavoritesLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">
                {t("loadingScholarships")}
              </span>
            </div>
          ) : scholarshipFavorites.length > 0 ? (
            <div className="gap-4 flex flex-col">
              {scholarshipFavorites.map((scholarshipFavorite) => (
                <ScholarshipCard
                  key={scholarshipFavorite.id}
                  scholarship={scholarshipFavorite.scholarship as any}
                  savedItems={scholarshipFavorites.map((s) => s.scholarshipId)}
                  onToggleSaved={onToggleScholarshipSaved}
                />
              ))}
            </div>
          ) : (
            <Empty className="w-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Star />
                </EmptyMedia>
                <EmptyTitle>{t("noFavoriteScholarships")}</EmptyTitle>
                <EmptyDescription>
                  {t("addFavoriteScholarships")}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/search">
                  <Button variant="outline" size="sm">
                    {t("searchScholarships")}
                  </Button>
                </Link>
              </EmptyContent>
            </Empty>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
