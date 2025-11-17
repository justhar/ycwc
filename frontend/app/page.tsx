"use client";

import { Button } from "@/components/ui/button";
import DottedMap from "dotted-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  MessageSquare,
  Target,
  Calendar,
  Users,
  Sparkles,
  CheckCircle,
  EarthIcon,
  Earth,
  ArrowRight,
  Map as MapIcon,
  MessageCircle,
  Activity,
} from "lucide-react";
import Image from "next/image";
import { Faq5 } from "@/components/ui/faq";
import { FeaturesSectionWithHoverEffects } from "@/components/features";

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <div className="px-5 py-3 flex flex-row justify-between items-center fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/50 border-b border-white/20">
        <div className="flex flex-row items-center">
          <Image
            src="/logo.svg"
            alt="Abroadly Logo"
            width={30}
            height={30}
            priority
            fetchPriority="high"
            className="inline-block mr-1.5"
          />
          <p className="font-semibold text-xl text-orange-500">Abroadly</p>
        </div>
        <div>
          <Button
            onClick={() => router.push("signin")}
            className="mr-2"
            size="sm"
            variant="outline"
          >
            Log In
          </Button>
          <Button
            onClick={() => router.push("signup")}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 hover:shadow-sm"
          >
            Sign Up
          </Button>
        </div>
      </div>
      <div className="w-full flex justify-center flex-col md:overflow-x-hidden h-full pt-5 md:min-h-screen">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center mx-auto px-10 gap-8">
          <div className="flex flex-col justify-center py-8">
            <h2 className="text-5xl font-semibold pt-10 md:pt-0">
              Study Abroad ga perlu ribet, pakai{" "}
              <span className="text-orange-500">Abroadly</span>!
            </h2>
            <p className="mt-4">
              Temukan universitas terbaik yang sesuai dengan minat, bakat, dan
              kemampuanmu! Dapatkan rekomendasi universitas yang
              dipersonalisasi, akses ke AI Assistant untuk konsultasi, dan
              pantau progress kamu dengan fitur Activity Tracker.
            </p>
            <div className="mt-4">
              <Button
                size="lg"
                onClick={() => router.push("/signup")}
                className="text-white hover:bg-transparent cursor-pointer hover:shadow-lg bg-gradient-to-b from-orange-500 to-orange-400 rounded-lg p-4 border border-orange-200"
              >
                Mulai sekarang! <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex gap-8 text-sm text-neutral-400 mt-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Lebih dari 100+ Universitas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Rekomendasi yang Dipersonalisasi</span>
              </div>
            </div>
          </div>
          <div className="relative aspect-[5/4] ">
            <Image
              src="/mit.jpg"
              alt="Browsing"
              width={720}
              height={500}
              priority
              fetchPriority="high"
              className="absolute md:-right-20 top-0 w-[120%] h-full object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
      <section className="px-4 py-8 ">
        <div className=" grid border rounded-t-lg md:grid-cols-2">
          <div>
            <div className="p-6 sm:p-12">
              <span className="text-muted-foreground flex items-center gap-2">
                <MapIcon className="size-4" />
                Jelajahi Universitas di Seluruh Dunia
              </span>

              <p className="mt-8 text-2xl font-semibold">
                Dengan Abroadly, kamu bisa menjelajahi berbagai universitas di
                seluruh dunia, membandingkan program studi, dan memilih yang
                paling sesuai dengan tujuan akademikmu.
              </p>
            </div>

            <div aria-hidden className="relative">
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 z-10 from-transparent to-orange-200 [background-image:radial-gradient(var(--tw-gradient-stops))] pointer-events-none"></div>
                <Map />
              </div>
            </div>
          </div>
          <div className="overflow-hidden border-t bg-zinc-50 p-6 sm:p-12 md:border-0 md:border-l dark:bg-transparent">
            <div className="relative z-10">
              <span className="text-muted-foreground flex items-center gap-2">
                <MessageCircle className="size-4" />
                Konsultasi dengan AI Assistant
              </span>

              <p className="my-8 text-2xl font-semibold">
                AI Assistant kami siap membantu menjawab pertanyaanmu tentang
                proses pendaftaran, beasiswa, dan kehidupan kampus di luar
                negeri.
              </p>
            </div>
            <div aria-hidden className="flex flex-col gap-8">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex justify-center items-center size-5 rounded-full border">
                    <span className="size-3 rounded-full bg-primary" />
                  </span>
                  <span className="text-muted-foreground text-xs">
                    Sat 22 Feb
                  </span>
                </div>
                <div className="rounded-lg bg-background mt-1.5 w-3/5 border p-3 text-xs">
                  Hi! Saya tertarik untuk belajar di luar negeri. Bisakah kamu
                  membantu saya?
                </div>
              </div>

              <div>
                <div className="rounded-lg mb-1 ml-auto w-3/5 bg-orange-500 p-3 text-xs text-white">
                  Tentu! Saya di sini untuk membantu kamu dengan segala
                  pertanyaan tentang belajar di luar negeri. Apa yang ingin kamu
                  ketahui?
                </div>
                <span className="text-muted-foreground block text-right text-xs">
                  Now
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-x border-b rounded-b-lg w-full">
          <div className="z-10 p-6 md:p-12">
            <span className="text-muted-foreground flex items-center gap-2">
              <Activity className="size-4" />
              Activity Tracker
            </span>

            <p className="my-8 text-2xl font-semibold">
              Gunakan fitur Activity Tracker untuk memantau progress kamu secara
              real-time dan pastikan semua proses berjalan lancar.
            </p>
            <div className="relative">
              <Image
                src="/tracker.png"
                alt="Tracker Preview"
                width={1920}
                height={1080}
                priority
                fetchPriority="high"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>
      <FeaturesSectionWithHoverEffects />
      <Faq5 />
      <footer className="border-t border-zinc-200  py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Abroadly Logo"
              priority
              fetchPriority="high"
              width={30}
              height={30}
              className="mr-2"
            />
            <span className="text-xl font-bold text-orange-500">Abroadly</span>
          </div>
          <div className="text-sm text-zinc-400">
            <p>&copy; 2025 Abroadly. Empowering your study abroad journey.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const map = new DottedMap({ height: 55, grid: "diagonal" });

const points = map.getPoints();

const svgOptions = {
  backgroundColor: "var(--color-background)",
  color: "oklch(70.5% 0.213 47.604)",
  radius: 0.15,
};

const Map = () => {
  const viewBox = `0 0 120 60`;
  return (
    <svg viewBox={viewBox} style={{ background: svgOptions.backgroundColor }}>
      {points.map((point: any, index: number) => (
        <circle
          key={index}
          cx={point.x}
          cy={point.y}
          r={svgOptions.radius}
          fill={svgOptions.color}
        />
      ))}
    </svg>
  );
};
