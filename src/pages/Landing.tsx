import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleEnterApp = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-[#141824] text-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.08),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(56,189,248,0.06),transparent_55%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-6">
        <div
          className={`transition-all duration-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold tracking-tight text-slate-100">
              MonoFi-AI
            </span>
            <Button
              onClick={handleEnterApp}
              className="bg-indigo-400 text-[#0f1220] hover:bg-indigo-300 font-medium h-9">
              Launch App
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight py-5">
              Intelligent DeFi <br /> Portfolio Intelligence
            </h1>

            <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
              MonoFi-AI provides AI-powered insights to analyze portfolios,
              monitor whale activity, and optimize DeFi strategies on Monad.
            </p>

            <div className="mt-7 flex justify-center gap-3">
              <Button
                onClick={handleEnterApp}
                size="lg"
                className="bg-indigo-400 text-[#0f1220] hover:bg-indigo-300 px-8">
                Enter App <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-200 hover:bg-slate-700/40 px-8">
                Learn More
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCol
              index="01"
              icon={<Bot />}
              title="AI Portfolio Assistant"
              desc="Get clear insights into portfolio performance and risk using AI-driven analysis."
            />
            <FeatureCol
              index="02"
              icon={<TrendingUp />}
              title="Whale & Market Signals"
              desc="Track significant on-chain capital movements and emerging market trends."
            />
            <FeatureCol
              index="03"
              icon={<Sparkles />}
              title="Smart Allocation"
              desc="Receive intelligent allocation suggestions tailored to DeFi volatility."
            />
          </div>

          <div className="mt-20 text-center text-xs text-slate-400">
            Built on Monad • Designed for next-generation DeFi
          </div>
        </div>
      </div>
    </div>
  );
};

const Feature = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="rounded-xl p-6 bg-[#1a1f33] border border-slate-700/60">
    <div className="mb-3 text-indigo-300">{icon}</div>
    <h3 className="text-base font-semibold mb-1">{title}</h3>
    <p className="text-sm text-slate-300 leading-relaxed">{desc}</p>
  </div>
);

const FeatureCol = ({
  index,
  icon,
  title,
  desc,
}: {
  index: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="relative px-2 border border-1 rounded-xl py-4 px-6">
    <div className="mb-3 text-indigo-300">
      {icon}
    </div>

    <h3 className="text-base font-semibold mb-2">{title}</h3>
    <p className="text-sm text-slate-300 leading-relaxed">
      {desc}
    </p>
  </div>
);



export default Landing;
