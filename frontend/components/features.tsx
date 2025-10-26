import { cn } from "@/lib/utils";
import {
  ArrowDownUp,
  Bolt,
  Cloud,
  DollarSign,
  EraserIcon,
  Heart,
  HelpCircle,
  Terminal,
  GraduationCap,
  MessageCircle,
  Activity,
  Earth,
  Users,
} from "lucide-react";
import { Badge } from "./ui/badge";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Rekomendasi Universitas",
      description:
        "Dapatkan rekomendasi universitas yang dipersonalisasi sesuai dengan minat dan kemampuanmu.",
      icon: <GraduationCap />,
    },
    {
      title: "AI Assistant",
      description:
        "Konsultasi dengan AI Assistant kami untuk mendapatkan jawaban cepat tentang study abroad.",
      icon: <MessageCircle />,
    },
    {
      title: "Activity Tracker",
      description:
        "Pantau status aplikasi kamu secara real-time dengan fitur Activity Tracker kami.",
      icon: <Activity />,
    },
    {
      title: "Informasi Beasiswa",
      description:
        "Temukan berbagai peluang beasiswa yang tersedia di universitas pilihanmu.",
      icon: <DollarSign />,
    },
    {
      title: "Jelajahi Dunia",
      description:
        "Eksplorasi universitas di seluruh dunia dan temukan yang paling sesuai dengan tujuan akademikmu.",
      icon: <Earth />,
    },
    {
      title: "Dukungan 24/7",
      description:
        "AI kami siap membantu kapan saja untuk memastikan pengalamanmu lancar.",
      icon: <HelpCircle />,
    },
    {
      title: "Platform Mudah Digunakan",
      description:
        "Dirancang untuk memberikan pengalaman pengguna yang intuitif dan efisien.",
      icon: <EraserIcon />,
    },
    {
      title: "Isi Profile Otomatis",
      description:
        "Hemat waktu dengan fitur pengisian profil otomatis kami yang cerdas.",
      icon: <Users />,
    },
  ];
  return (
    <div className="pt-10">
      <div className="text-center">
        <h1 className="mt-4 text-4xl font-semibold">Fitur Unggulan</h1>
        <p className="mt-6 font-medium text-muted-foreground">
          Temukan berbagai fitur yang dirancang untuk mempermudah perjalanan
          studimu ke luar negeri.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col border-r border-zinc-200 py-10 relative group/feature",
        (index === 0 || index === 4) && "border-l ",
        index < 4 && "border-b"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-orange-100 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-orange-100 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-700">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-300  group-hover/feature:bg-orange-200 transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-800">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
