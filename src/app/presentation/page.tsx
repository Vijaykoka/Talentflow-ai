"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconPlayerPlay,
  IconPlayerPause,
  IconMaximize,
  IconMinimize,
  IconFlame,
  IconUsers,
  IconSparkles,
  IconChartPie,
  IconArrowBackUp,
  IconSettings,
  IconDeviceLaptop,
  IconDatabase,
  IconLock,
  IconCpu,
  IconTimeline,
  IconTarget,
  IconHelp,
  IconPointer,
  IconSearch,
  IconCheck,
} from "@tabler/icons-react";
import Link from "next/link";

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  theme: "dark" | "gradient" | "neon";
}

const SLIDES: Slide[] = [
  { id: 1, title: "TalentFlow AI", subtitle: "End-to-End Talent Fulfillment Platform", theme: "gradient" },
  { id: 2, title: "The Core Enterprise Pain Points", subtitle: "High Cost of Inefficiency", theme: "dark" },
  { id: 3, title: "The Solution: TalentFlow AI", subtitle: "Next-Gen Acquisition Value Pillars", theme: "neon" },
  { id: 4, title: "Feature Suite Explorer", subtitle: "Click modules to inspect core features", theme: "dark" },
  { id: 5, title: "Current Technical Stack", subtitle: "Next.js Core Architecture", theme: "dark" },
  { id: 6, title: "AI/ML Matching Engine Simulator", subtitle: "Drag sliders to test weighted matching scores", theme: "neon" },
  { id: 7, title: "Enterprise Scaling Blueprint", subtitle: "Phase 1 & 2: Infrastructure and Advanced AI", theme: "dark" },
  { id: 8, title: "Enterprise Scaling Blueprint", subtitle: "Phase 3 & 4: Integrations and Security Compliance", theme: "dark" },
  { id: 9, title: "Conclusion & Strategic Roadmap", subtitle: "Transforming human capital operations", theme: "gradient" },
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [laserPointer, setLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: 0, y: 0 });
  const [timelinePhase, setTimelinePhase] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // AI Matching Simulator States
  const [skillWeight, setSkillWeight] = useState(50);
  const [expWeight, setExpWeight] = useState(30);
  const [rateWeight, setRateWeight] = useState(20);
  const [simulatedScore, setSimulatedScore] = useState(88);

  // Feature Explorer States
  const [selectedFeature, setSelectedFeature] = useState("dashboard");

  // Q&A Simulator
  const [qaInput, setQaInput] = useState("");
  const [qaSubmitted, setQaSubmitted] = useState(false);

  // Adjust remaining weight proportionally to ensure sum is 100%
  const handleWeightChange = (type: "skill" | "exp" | "rate", value: number) => {
    if (type === "skill") {
      setSkillWeight(value);
      const remaining = 100 - value;
      // split remaining 60/40 between exp and rate
      setExpWeight(Math.round(remaining * 0.6));
      setRateWeight(Math.round(remaining * 0.4));
    } else if (type === "exp") {
      setExpWeight(value);
      const remaining = 100 - value;
      setSkillWeight(Math.round(remaining * 0.7));
      setRateWeight(Math.round(remaining * 0.3));
    } else {
      setRateWeight(value);
      const remaining = 100 - value;
      setSkillWeight(Math.round(remaining * 0.6));
      setExpWeight(Math.round(remaining * 0.4));
    }
  };

  // Calculate simulated score based on weights
  useEffect(() => {
    // Simulated candidate: 90% skills, 80% experience, 95% rate
    const score = Math.round(
      (0.9 * skillWeight) + (0.8 * expWeight) + (0.95 * rateWeight)
    );
    setSimulatedScore(score);
  }, [skillWeight, expWeight, rateWeight]);

  const handleNext = useCallback(() => {
    setCurrentSlide((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "l" || e.key === "L") {
        setLaserPointer((p) => !p);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // Autoplay handler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        handleNext();
      }, 7000); // 7s auto slide change
    }
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  // Mouse move handler for laser pointer
  const handleMouseMove = (e: React.MouseEvent) => {
    if (laserPointer) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative flex flex-col justify-between w-full min-h-screen bg-[#060913] text-[#F3F4F6] font-sans overflow-hidden select-none"
      style={{
        backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(20, 26, 48, 0.6) 0%, rgba(6, 9, 19, 1) 100%)",
      }}
    >
      {/* Laser Pointer */}
      {laserPointer && (
        <div
          className="pointer-events-none fixed w-8 h-8 rounded-full border border-red-500/50 bg-red-600 mix-blend-screen shadow-[0_0_24px_rgba(239,68,68,1)] transition-all duration-75 -translate-x-1/2 -translate-y-1/2 z-[9999]"
          style={{ left: `${laserPos.x}px`, top: `${laserPos.y}px` }}
        />
      )}

      {/* Floating Animated Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[150px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[150px] animate-pulse pointer-events-none" />

      {/* Presentation Top bar */}
      <header className="relative flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#060913]/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-cyan-400 border border-white/5 transition duration-200">
              <IconArrowBackUp size={14} /> Back to TalentFlow
            </button>
          </Link>
          <span className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-bold tracking-wider text-white">TALENTFLOW AI</h1>
          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] uppercase font-bold tracking-widest border border-cyan-500/20">
            Enterprise Pitch
          </span>
        </div>

        <div className="text-xs text-white/50 font-medium">
          Slide {currentSlide + 1} of {SLIDES.length} : {SLIDES[currentSlide].subtitle}
        </div>
      </header>

      {/* SLIDE CANVAS */}
      <main className="relative flex-1 flex items-center justify-center px-12 py-8 z-10 overflow-hidden">
        {/* Slide transitions wrapper */}
        <div className="w-full max-w-6xl h-full flex flex-col justify-center transition-all duration-500 transform scale-100">
          
          {/* SLIDE 1: Cover slide */}
          {currentSlide === 0 && (
            <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full blur-3xl opacity-20 scale-150 animate-pulse" />
                <div className="relative flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                  <IconSparkles size={48} className="text-white animate-spin-slow" />
                </div>
              </div>

              <div className="space-y-4 max-w-3xl">
                <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">
                  TalentFlow AI
                </h2>
                <p className="text-xl md:text-3xl font-medium bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent max-w-2xl mx-auto">
                  End-to-End Talent Fulfillment Platform
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-violet-500 to-cyan-400 mx-auto rounded-full mt-4" />
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 max-w-xl mx-auto text-center border-t border-white/5 w-full">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Event</p>
                  <p className="text-sm font-semibold text-white/80 mt-1">Vibeathon Hackathon</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Target Era</p>
                  <p className="text-sm font-semibold text-white/80 mt-1">Enterprise B2B SaaS</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/40">Focus</p>
                  <p className="text-sm font-semibold text-cyan-400 mt-1">Revenue Recovery</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Pain points */}
          {currentSlide === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
                  The Problem
                </div>
                <h2 className="text-4xl font-extrabold text-white leading-tight">
                  The Cost of Recruitment Inefficiency
                </h2>
                <p className="text-white/60 leading-relaxed">
                  Traditional enterprise recruitment is fragmented, slow, and completely blind to margin profitability during candidate screening.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                    <p className="text-white/80 text-sm">
                      <strong className="text-white">Fragmented Pipelines:</strong> Sifting through emails, ATS sheets, and vendor databases manually.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2.5 flex-shrink-0" />
                    <p className="text-white/80 text-sm">
                      <strong className="text-white">Zero Margin Awareness:</strong> Placements recorded without calculations of Bill Rates vs Pay Rates vs amortized commission fees.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl hover:border-red-500/20 transition duration-300">
                  <span className="text-3xl">⏱️</span>
                  <h3 className="text-3xl font-extrabold text-red-400 mt-4">44 Days</h3>
                  <p className="text-sm font-semibold text-white/80 mt-1">Avg Time-to-Hire</p>
                  <p className="text-xs text-white/40 mt-2">Slow candidate processing stalls key initiatives.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl hover:border-red-500/20 transition duration-300">
                  <span className="text-3xl">💸</span>
                  <h3 className="text-3xl font-extrabold text-red-400 mt-4">$2,000 / day</h3>
                  <p className="text-sm font-semibold text-white/80 mt-1">Revenue Loss</p>
                  <p className="text-xs text-white/40 mt-2">Empty seats lead to massive daily revenue leakage.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl hover:border-red-500/20 transition duration-300">
                  <span className="text-3xl">🔌</span>
                  <h3 className="text-3xl font-extrabold text-red-400 mt-4">Manual</h3>
                  <p className="text-sm font-semibold text-white/80 mt-1">Resume Screening</p>
                  <p className="text-xs text-white/40 mt-2">Error-prone keyword matches miss high-potential talent.</p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 shadow-xl hover:border-red-500/20 transition duration-300">
                  <span className="text-3xl">🧩</span>
                  <h3 className="text-3xl font-extrabold text-red-400 mt-4">Fragmented</h3>
                  <p className="text-sm font-semibold text-white/80 mt-1">Systems</p>
                  <p className="text-xs text-white/40 mt-2">Recruiters jump across 5+ disconnected SaaS tools.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Proposed Solution */}
          {currentSlide === 2 && (
            <div className="space-y-10 animate-fade-in">
              <div className="text-center max-w-3xl mx-auto space-y-4">
                <div className="inline-flex px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  The Solution
                </div>
                <h2 className="text-4xl font-extrabold text-white">
                  Streamlined, Predictive Talent Pipelines
                </h2>
                <p className="text-white/60">
                  TalentFlow AI collapses the typical 44-day placement latency into a fully optimized 5-day cycle using three distinct technological pillars.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-8 rounded-2xl bg-[#0F172A]/80 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all duration-300" />
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20 mb-6">
                    <IconFlame size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Touchless Fulfillment</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Auto-skill extraction from raw requirements. Matching candidates identified in seconds, slashing the cycle from weeks to hours.
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-[#0F172A]/80 border border-white/5 hover:border-violet-500/30 transition-all duration-300 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-300" />
                  <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 mb-6">
                    <IconSparkles size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Composite AI Matching</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    No black boxes. Composite matching grades candidates transparently by mapping Skills (50%), Experience (30%), and Bill vs Cost Rates (20%).
                  </p>
                </div>

                <div className="p-8 rounded-2xl bg-[#0F172A]/80 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6">
                    <IconChartPie size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">12M Margin Forecasting</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Built-in ROI intelligence. Instantly projects annual billing profitability, gross margins, and hiring break-even cycles prior to deployment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Interactive Feature Explorer */}
          {currentSlide === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch animate-fade-in">
              <div className="md:col-span-1 flex flex-col justify-between py-2">
                <div className="space-y-4">
                  <div className="inline-flex px-3 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
                    Functional Architecture
                  </div>
                  <h2 className="text-3xl font-extrabold text-white leading-tight">
                    Modular Dashboard Features
                  </h2>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Click each module component to explore the built-in functional components available in our primary system interface.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-6">
                  {[
                    { id: "dashboard", label: "Operational Dashboard", icon: IconChartPie },
                    { id: "demands", label: "Smart Job Demands", icon: IconTarget },
                    { id: "candidates", label: "Talent Pool & Hot Talents", icon: IconUsers },
                    { id: "matching", label: "Explainable AI Match", icon: IconSparkles },
                    { id: "hires", label: "Margin Placement Tracker", icon: IconFlame },
                    { id: "vendors", label: "Vendor Scorecards", icon: IconDeviceLaptop },
                  ].map((feat) => (
                    <button
                      key={feat.id}
                      onClick={() => setSelectedFeature(feat.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-bold transition duration-200 ${
                        selectedFeature === feat.id
                          ? "bg-gradient-to-r from-violet-600/20 to-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                          : "bg-white/5 border-white/5 hover:border-white/10 text-white/60 hover:text-white"
                      }`}
                    >
                      <feat.icon size={16} className={selectedFeature === feat.id ? "text-cyan-400" : "text-white/40"} />
                      {feat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature details card */}
              <div className="md:col-span-2 flex flex-col justify-center p-8 rounded-3xl bg-[#090D1C] border border-white/5 relative overflow-hidden shadow-2xl min-h-[400px]">
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />

                {selectedFeature === "dashboard" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">01.</span> Cumulative Dashboard View
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      A centralized mission control displaying high-level metrics dynamically parsed from real-time database models.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Demands by Priority</span>
                        <p className="text-sm font-semibold text-white/90 mt-1">High-Priority Alerts</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Revenue at Risk</span>
                        <p className="text-sm font-semibold text-white/90 mt-1">Calculates cost of empty seats</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedFeature === "demands" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">02.</span> Smart Job Demands
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Allows creation, updating, and status monitoring of job requirements with customized rate bands, skill classifications, and urgency rankings.
                    </p>
                    <ul className="space-y-2 text-xs text-white/60">
                      <li className="flex items-center gap-2"><IconCheck size={14} className="text-cyan-400" /> Automated status pipeline (Open → Interview → Placed)</li>
                      <li className="flex items-center gap-2"><IconCheck size={14} className="text-cyan-400" /> Associated client rate ceilings</li>
                    </ul>
                  </div>
                )}

                {selectedFeature === "candidates" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">03.</span> Talent Pool & Hot Talents
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Tracks available resource skills, experience markers, expected remuneration, and auto-ranks top talent.
                    </p>
                    <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
                      🔥 **Hot Talent Auto-Flagging:** High-percentile matching candidates with specialized rare skills are surfaced dynamically on top of lists to increase visibility.
                    </div>
                  </div>
                )}

                {selectedFeature === "matching" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">04.</span> Transparent AI Weighted Match
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Batch compares the entire active candidate supply against open requirements using programmatic mathematical formulas, completely eliminating human selection bias.
                    </p>
                    <p className="text-xs text-white/50">
                      Yields granular match records containing percentiles accompanied by plain-English explanations of the score.
                    </p>
                  </div>
                )}

                {selectedFeature === "hires" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">05.</span> Margin Placement Tracker
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Stores employment start dates, client pay schedules, and candidate pay scales, automatically calculating direct gross margin models.
                    </p>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs">
                      Margin = Client Billing Rate - (Candidate Pay Rate + Amortized Commission Cost)
                    </div>
                  </div>
                )}

                {selectedFeature === "vendors" && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">06.</span> Third-Party Vendor Scorecards
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Tracks agency staffing partner success ratios, commissions, and performance scores based on historically successfully filled positions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SLIDE 5: Current Tech Stack */}
          {currentSlide === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="inline-flex px-3 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
                  Technology Stack
                </div>
                <h2 className="text-4xl font-extrabold text-white">
                  Modern, High-Velocity Architecture
                </h2>
                <p className="text-white/60 max-w-2xl mx-auto">
                  Built on a robust open-source React ecosystem designed for immediate deployment, lightweight data manipulation, and visual speed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition duration-300 flex flex-col justify-between">
                  <div>
                    <IconDeviceLaptop className="text-violet-400 w-10 h-10 mb-4" />
                    <h3 className="text-base font-bold text-white">Frontend Core</h3>
                    <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                      Next.js 13/14 App Router, React 18, and static TypeScript compiler for type-safe rendering.
                    </p>
                  </div>
                  <span className="text-[10px] text-violet-400 uppercase font-bold tracking-widest mt-4">Fluid Interfaces</span>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition duration-300 flex flex-col justify-between">
                  <div>
                    <IconSettings className="text-cyan-400 w-10 h-10 mb-4" />
                    <h3 className="text-base font-bold text-white">Server Logic</h3>
                    <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                      Lightweight Next.js serverless API routes managing secure REST endpoints in JSON formats.
                    </p>
                  </div>
                  <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest mt-4">Scalable Routes</span>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition duration-300 flex flex-col justify-between">
                  <div>
                    <IconDatabase className="text-emerald-400 w-10 h-10 mb-4" />
                    <h3 className="text-base font-bold text-white">ORM & Relational DB</h3>
                    <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                      Prisma ORM schema modeling connected to SQLite database for lightning-fast prototyping.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest mt-4">Zero Configuration</span>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition duration-300 flex flex-col justify-between">
                  <div>
                    <IconLock className="text-amber-400 w-10 h-10 mb-4" />
                    <h3 className="text-base font-bold text-white">Session Security</h3>
                    <p className="text-[11px] text-white/50 mt-2 leading-relaxed">
                      NextAuth.js for credentials handling, secure session scopes, and custom middleware authorization guards.
                    </p>
                  </div>
                  <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest mt-4">Secure Sign-Ins</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: AI matching simulator */}
          {currentSlide === 5 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  Engine Mechanics
                </div>
                <h2 className="text-4xl font-extrabold text-white">
                  Interactive AI Scoring Simulator
                </h2>
                <p className="text-white/60 leading-relaxed text-sm">
                  TalentFlow AI does not run on opaque logic. Adjust the sliders to see how candidate fit scores fluctuate dynamically based on organizational resource matching weights.
                </p>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Skills Overlap Weight:</span>
                    <span className="font-bold text-cyan-400">{skillWeight}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Years Experience Fit Weight:</span>
                    <span className="font-bold text-violet-400">{expWeight}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-white/80">
                    <span>Expected CTC Fit Weight:</span>
                    <span className="font-bold text-emerald-400">{rateWeight}%</span>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-[#090D1C]/90 border border-white/5 shadow-2xl space-y-6">
                <h3 className="text-lg font-bold text-white">Weight Tuning Matrix</h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Skills Match Weight</span>
                      <span>{skillWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={skillWeight}
                      onChange={(e) => handleWeightChange("skill", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Experience Match Weight</span>
                      <span>{expWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={expWeight}
                      onChange={(e) => handleWeightChange("exp", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-400"
                    />
                  </div>

                  <div>
                    <label className="flex justify-between text-xs text-white/50 mb-1">
                      <span>Compensation Fit Weight</span>
                      <span>{rateWeight}%</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={rateWeight}
                      onChange={(e) => handleWeightChange("rate", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Simulated Candidate Fit</span>
                    <h4 className="text-3xl font-extrabold text-white mt-1">{simulatedScore}%</h4>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      simulatedScore >= 90
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 animate-pulse"
                        : simulatedScore >= 75
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/25"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/25"
                    }`}
                  >
                    {simulatedScore >= 90 ? "Excellent Fit" : simulatedScore >= 75 ? "Strong Fit" : "Moderate Fit"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: Enterprise Scaling - Part 1 */}
          {currentSlide === 6 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex px-3 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    Infrastructure Scale
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Scaling Blueprint: Phase 1 & 2</h2>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTimelinePhase(1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      timelinePhase === 1 ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/5 text-white/50"
                    }`}
                  >
                    Phase 1: DB & Cache
                  </button>
                  <button
                    onClick={() => setTimelinePhase(2)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      timelinePhase === 2 ? "bg-violet-500/20 border-violet-500 text-violet-300" : "bg-white/5 border-white/5 text-white/50"
                    }`}
                  >
                    Phase 2: Semantic AI
                  </button>
                </div>
              </div>

              {timelinePhase === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <IconDatabase className="text-cyan-400" /> Relational Data Scaling
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Upgrade the simple SQLite local datastore to high-availability cluster databases to handle high transaction volumes and concurrently running API requests safely.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">Amazon Aurora Serverless / RDS Postgres</h4>
                        <p className="text-[11px] text-white/40 mt-1">Multi-AZ deployments featuring horizontal read-replicas for intensive query loads.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">Redis Analytics Cache</h4>
                        <p className="text-[11px] text-white/40 mt-1">High-speed cache buffers serving heavy metric aggregates to prevent query bottlenecks.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-[#090D1C] border border-white/5 flex flex-col justify-center text-center shadow-xl">
                    <span className="text-4xl text-cyan-400 mb-4 animate-bounce">⚡</span>
                    <h4 className="text-base font-bold text-white">Enterprise Concurrent Workloads</h4>
                    <p className="text-xs text-white/40 max-w-sm mx-auto mt-2 leading-relaxed">
                      Transitioning the database architecture scales candidate records limits from thousands to millions, accommodating global organizational rosters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <IconCpu className="text-violet-400" /> Semantic Neural Networks
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Evolve exact-string matching pipelines to semantic language reasoning models, understanding complex resume terminologies natively.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">Gemini Pro API Integration</h4>
                        <p className="text-[11px] text-white/40 mt-1">Deep contextual mapping of candidate histories to raw Job Descriptions.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">Vector Embedding Indexes (pgvector)</h4>
                        <p className="text-[11px] text-white/40 mt-1">High-dimensional vector lookups enabling semantic searches (e.g., matching React to Next.js automatically).</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-[#090D1C] border border-white/5 flex flex-col justify-center text-center shadow-xl">
                    <span className="text-4xl text-violet-400 mb-4">🧠</span>
                    <h4 className="text-base font-bold text-white">Vector Similarity Search</h4>
                    <p className="text-xs text-white/40 max-w-sm mx-auto mt-2 leading-relaxed">
                      Generates semantic embeddings using Google AI, reducing misidentified talent criteria and improving placement matching accuracy dramatically.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 8: Enterprise Scaling - Part 2 */}
          {currentSlide === 7 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex px-3 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
                    Ecosystem Scale
                  </div>
                  <h2 className="text-3xl font-extrabold text-white">Scaling Blueprint: Phase 3 & 4</h2>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setTimelinePhase(3)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      timelinePhase === 3 ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/5 text-white/50"
                    }`}
                  >
                    Phase 3: Integrations
                  </button>
                  <button
                    onClick={() => setTimelinePhase(4)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      timelinePhase === 4 ? "bg-violet-500/20 border-violet-500 text-violet-300" : "bg-white/5 border-white/5 text-white/50"
                    }`}
                  >
                    Phase 4: Security Compliance
                  </button>
                </div>
              </div>

              {timelinePhase === 3 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <IconTimeline className="text-cyan-400" /> Ecosystem Connectivity
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Embed the platform smoothly within the enterprise tools ecosystem using modular connectors and queuing architectures.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">RabbitMQ & BullMQ Workers</h4>
                        <p className="text-[11px] text-white/40 mt-1">Delegating heavy PDF CV parsing and scoring pipelines to background micro-tasks.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">ATS & HRIS API Connectors</h4>
                        <p className="text-[11px] text-white/40 mt-1">Two-way synchronizations linking records natively into Workday, Lever, or Greenhouse.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-[#090D1C] border border-white/5 flex flex-col justify-center text-center shadow-xl">
                    <span className="text-4xl text-cyan-400 mb-4">🔌</span>
                    <h4 className="text-base font-bold text-white">Background Job Queues</h4>
                    <p className="text-xs text-white/40 max-w-sm mx-auto mt-2 leading-relaxed">
                      Ensures the principal browser interface is completely unaffected by high-volume background CV upload batches and matching compute cycles.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <IconLock className="text-violet-400" /> Enterprise Guardrails
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Ensure full security protocols, candidate data encryption, and authorization checks necessary for Fortune-500 deployment.
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">Okta / Azure AD SAML Single Sign-On</h4>
                        <p className="text-[11px] text-white/40 mt-1">SSO and identity scopes integrated into existing centralized HR credentials platforms.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <h4 className="text-xs font-bold text-white">SOC 2 & GDPR PII Security</h4>
                        <p className="text-[11px] text-white/40 mt-1">Granular field-level encryption, multi-tenant workspace separation, and full database transaction logs.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 rounded-2xl bg-[#090D1C] border border-white/5 flex flex-col justify-center text-center shadow-xl">
                    <span className="text-4xl text-violet-400 mb-4">🛡️</span>
                    <h4 className="text-base font-bold text-white">Multi-Tenant Isolation</h4>
                    <p className="text-xs text-white/40 max-w-sm mx-auto mt-2 leading-relaxed">
                      Enforces absolute database schema isolation between distinct client company directories, guaranteeing secure and private records.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SLIDE 9: Conclusion & Roadmap */}
          {currentSlide === 8 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex px-3 py-1 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider">
                  Strategic Future
                </div>
                <h2 className="text-4xl font-extrabold text-white leading-tight">
                  Ready for Global Enterprise Deployments
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  TalentFlow AI successfully transitions recruiting operations from an unquantifiable manual cost center to a streamlined, predictive revenue engine.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Operational Velocity</p>
                    <p className="text-base font-extrabold text-cyan-400 mt-1">89% reduction</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Financial Visibility</p>
                    <p className="text-base font-extrabold text-violet-400 mt-1">12M Forecasts</p>
                  </div>
                </div>
              </div>

              {/* Interactive Q&A Form */}
              <div className="p-8 rounded-3xl bg-[#090D1C] border border-white/5 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <IconHelp size={20} className="text-cyan-400" /> Interactive Q&A Board
                </h3>
                <p className="text-xs text-white/50">
                  Have a question about security, scaling, or integrations? Post it below to simulate stakeholder inquiries.
                </p>

                {qaSubmitted ? (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs space-y-2 animate-fade-in">
                    <p className="font-bold flex items-center gap-1">✓ Question Logged</p>
                    <p className="text-white/70 italic">&quot;{qaInput}&quot;</p>
                    <p className="text-[10px] text-white/40 mt-2">
                      Our system architect will address this inquiry during live panel reviews. Thank you!
                    </p>
                    <button
                      onClick={() => {
                        setQaSubmitted(false);
                        setQaInput("");
                      }}
                      className="mt-2 text-cyan-400 underline cursor-pointer font-bold block"
                    >
                      Ask another question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={qaInput}
                      onChange={(e) => setQaInput(e.target.value)}
                      placeholder="e.g., How does the database isolate tenant PII data?"
                      className="w-full h-24 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 focus:border-cyan-500 focus:outline-none text-xs text-white placeholder-white/30 resize-none transition"
                    />
                    <button
                      onClick={() => {
                        if (qaInput.trim()) setQaSubmitted(true);
                      }}
                      disabled={!qaInput.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-xs font-bold text-white hover:opacity-90 transition disabled:opacity-50"
                    >
                      Submit Inquiry
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* FOOTER NAVIGATION CONTROL PANEL */}
      <footer className="relative flex flex-col items-center justify-between px-8 py-5 border-t border-white/5 bg-[#060913]/60 backdrop-blur-md z-20 space-y-4 sm:space-y-0 sm:flex-row">
        {/* Presenter controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLaserPointer((p) => !p)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              laserPointer ? "bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.2)]" : "bg-white/5 border-white/5 text-white/60 hover:text-white"
            }`}
          >
            <IconPointer size={14} /> Laser Pointer (L)
          </button>
        </div>

        {/* Sliders navigation controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white/80 hover:text-white transition duration-200"
          >
            <IconArrowLeft size={16} />
          </button>

          <div className="flex items-center gap-1.5">
            {SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" : "w-2 bg-white/10 hover:bg-white/20"
                }`}
                title={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white/80 hover:text-white transition duration-200"
          >
            <IconArrowRight size={16} />
          </button>
        </div>

        {/* Global state play, minimize/maximize controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className={`flex items-center justify-center w-9 h-9 rounded-full border transition ${
              isPlaying ? "bg-cyan-500/20 border-cyan-500 text-cyan-300" : "bg-white/5 border-white/5 text-white/60 hover:text-white"
            }`}
            title={isPlaying ? "Pause slideshow" : "Play slideshow auto-play (7s)"}
          >
            {isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-white/60 hover:text-white transition duration-200"
            title="Toggle fullscreen mode (F)"
          >
            {isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
          </button>
        </div>
      </footer>
    </div>
  );
}
