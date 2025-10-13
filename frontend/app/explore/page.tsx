import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="grid mb-20 mx-5 grid-cols-1 lg:grid-cols-2">
        <div>
          <h2 className="text-5xl font-semibold">
            Cari Universitas yang cocok dengan AI Match
          </h2>
          <p className="mt-2">
            Temukan universitas terbaik yang sesuai dengan minat dan bakatmu.
          </p>
          <div>
            <Button className="mt-5" size="lg">
              Mulai Pencarian <Sparkles className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-8 text-sm text-neutral-400 mt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>30-Day ROI Guarantee</span>
            </div>
          </div>
        </div>
        <div className="w-full h-full bg-amber-300 rounded-lg">Sigma</div>
      </div>
    </div>
  );
}
