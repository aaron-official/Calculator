"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, Coins, ShieldCheck, Zap, Activity } from "lucide-react";

type Runner = "python" | "rust";

interface RaceProgress {
  runner?: Runner;
  progress?: number;
  event?: string;
}

interface RaceResult {
  winner: Runner;
  betOn: Runner;
  amount: number;
}

export default function RaceTrack() {
  const [pyProgress, setPyProgress] = useState(0);
  const [rsProgress, setRsProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winnerResult, setWinnerResult] = useState<RaceResult | null>(null);
  const [betOn, setBetOn] = useState<Runner | null>(null);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(100);
  const [handicap, setHandicap] = useState(50000); 
  const [operation, setOperation] = useState("1"); 

  const eventSourceRef = useRef<EventSource | null>(null);

  const startRace = () => {
    if (isRacing || !betOn || balance < betAmount) return;

    setPyProgress(0);
    setRsProgress(0);
    setIsRacing(true);
    setWinnerResult(null);

    const url = `/api/race?op=${operation}&pyCount=1000&rsCount=${handicap}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data: RaceProgress = JSON.parse(event.data);

      if (data.runner === "python") {
        setPyProgress((prev) => {
          if (prev >= 100) return prev;
          const next = data.progress || 0;
          if (next >= 100) {
            handleRaceEnd("python", es);
          }
          return next;
        });
      } else if (data.runner === "rust") {
        setRsProgress((prev) => {
          if (prev >= 100) return prev;
          const next = data.progress || 0;
          if (next >= 100) {
            handleRaceEnd("rust", es);
          }
          return next;
        });
      } else if (data.event === "complete") {
        setIsRacing(false);
        es.close();
      }
    };

    es.onerror = () => {
      setIsRacing(false);
      es.close();
    };
  };

  const handleRaceEnd = (winner: Runner, es: EventSource) => {
    setWinnerResult((prev) => {
        if (prev) return prev; // Already have a winner
        
        setIsRacing(false);
        es.close();

        // Calculate final balance change
        const isWin = winner === betOn;
        const change = isWin ? betAmount : -betAmount;
        setBalance(b => b + change);

        return { winner, betOn: betOn!, amount: betAmount };
    });
  };

  const resetRace = () => {
    setPyProgress(0);
    setRsProgress(0);
    setWinnerResult(null);
    setIsRacing(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Header & Balance */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent italic leading-tight">
              PERFORMANCE DUEL
            </h1>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
              <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
              Real-Time CLI Benchmarking
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-4 rounded-2xl border border-yellow-500/20 shadow-inner">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-yellow-500/50 uppercase tracking-tighter">Current Balance</span>
              <div className="flex items-center gap-2">
                <Coins className="text-yellow-500 w-5 h-5" />
                <span className="text-3xl font-mono font-black text-yellow-500 tracking-tighter">${balance}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Bet Picker */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-5">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Choose Champion
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {(["python", "rust"] as Runner[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setBetOn(r)}
                  disabled={isRacing}
                  className={`relative overflow-hidden group py-4 rounded-2xl font-black transition-all active:scale-95 ${
                    betOn === r
                      ? "bg-slate-100 text-slate-950 shadow-lg scale-105 z-10"
                      : "bg-slate-800/50 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="relative z-10">{r === "python" ? "🐍 Python" : "🦀 Rust"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Op */}
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-5 lg:col-span-2">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Operation</h2>
                <select 
                  value={operation} 
                  onChange={(e) => setOperation(e.target.value)}
                  disabled={isRacing}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-blue-500/50 appearance-none cursor-pointer hover:border-slate-700 transition-colors text-slate-100"
                >
                  <option value="1">Addition (+)</option>
                  <option value="2">Subtraction (-)</option>
                  <option value="3">Multiplication (*)</option>
                  <option value="4">Division (/)</option>
                </select>
              </div>
              <div className="space-y-4">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Bet Amount</h2>
                <div className="flex gap-2">
                  {[100, 500].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      disabled={isRacing}
                      className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                        betAmount === amt ? "bg-slate-100 text-slate-950" : "bg-slate-800/50 text-slate-500 hover:bg-slate-800"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-500" /> Hardware Handicap
                </h2>
                <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                  Rust processing {handicap.toLocaleString()} numbers
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="500000"
                step="5000"
                value={handicap}
                onChange={(e) => setHandicap(parseInt(e.target.value))}
                disabled={isRacing}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 transition-all hover:accent-orange-400"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col justify-center">
            <button
              onClick={isRacing ? resetRace : startRace}
              disabled={!betOn || (balance < betAmount && !isRacing)}
              className={`group relative overflow-hidden w-full h-full min-h-[80px] rounded-3xl font-black text-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl disabled:opacity-50 disabled:grayscale ${
                isRacing
                  ? "bg-red-500/10 text-red-500 border-2 border-red-500/30 hover:bg-red-500/20"
                  : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-emerald-500/20 hover:scale-[1.02]"
              }`}
            >
              <div className="relative z-10 flex items-center gap-3">
                {isRacing ? <RotateCcw className="w-8 h-8" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
                <span className="tracking-tighter">{isRacing ? "ABORT" : "START RACE"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* The Arena */}
        <div className="bg-slate-900/60 p-6 md:p-12 rounded-[3rem] border border-slate-800/50 shadow-inner relative overflow-hidden">
           {/* Finish Line Area */}
           <div className="absolute right-0 top-0 bottom-0 w-32 md:w-48 bg-gradient-to-l from-slate-800/20 to-transparent pointer-events-none" />
           <div className="absolute right-20 md:right-32 top-0 bottom-0 w-2 bg-white/5 border-x border-white/10 z-0" />
           
           <div className="space-y-16 md:space-y-24 relative z-10 py-8">
              {/* Python Lane */}
              <div className="relative">
                <div className="flex justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                      <span className="text-sm font-black text-blue-400">01</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400/80">Python Interpreter v3.12</span>
                  </div>
                  <span className="font-mono font-bold text-blue-400">{pyProgress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full w-full relative border border-slate-800 shadow-inner overflow-visible">
                  {/* Progress Glow */}
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-blue-500/20 rounded-full"
                    animate={{ width: `${pyProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  />
                  {/* Runner */}
                  <motion.div 
                    animate={{ left: `${pyProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className="absolute -top-6 -translate-x-1/2 w-16 h-16 flex flex-col items-center justify-center z-20 cursor-default"
                  >
                    <div className="text-4xl drop-shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-bounce-slow">🐍</div>
                    <div className="w-8 h-2 bg-blue-500/40 blur-md rounded-full mt-1" />
                  </motion.div>
                </div>
              </div>

              {/* Rust Lane */}
              <div className="relative">
                <div className="flex justify-between mb-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                      <span className="text-sm font-black text-orange-400">02</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-orange-400/80">Rust Native Binary 2024</span>
                  </div>
                  <span className="font-mono font-bold text-orange-400">{rsProgress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full w-full relative border border-slate-800 shadow-inner overflow-visible">
                   {/* Progress Glow */}
                   <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-orange-500/20 rounded-full"
                    animate={{ width: `${rsProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  />
                  {/* Runner */}
                  <motion.div 
                    animate={{ left: `${rsProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className="absolute -top-6 -translate-x-1/2 w-16 h-16 flex flex-col items-center justify-center z-20 cursor-default"
                  >
                    <div className="text-4xl drop-shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-bounce-slow">🦀</div>
                    <div className="w-8 h-2 bg-orange-500/40 blur-md rounded-full mt-1" />
                  </motion.div>
                </div>
              </div>
           </div>

           {/* Finish Line Text */}
           <div className="absolute right-6 top-1/2 -rotate-90 translate-y-[-50%] pointer-events-none">
              <span className="text-4xl md:text-6xl font-black text-slate-800/30 tracking-widest uppercase text-slate-400">Finish Line</span>
           </div>
        </div>

        {/* Results Modal */}
        <AnimatePresence>
          {winnerResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.9, y: 40 }}
                animate={{ scale: 1, y: 0 }}
                className={`relative w-full max-w-lg p-10 rounded-[3rem] border-2 text-center space-y-6 shadow-[0_0_100px_rgba(0,0,0,0.5)] ${
                  winnerResult.winner === "python" 
                    ? "bg-blue-900/20 border-blue-500/50" 
                    : "bg-orange-900/20 border-orange-500/50"
                }`}
              >
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                  winnerResult.winner === "python" ? "bg-blue-600 border-blue-400" : "bg-orange-600 border-orange-400"
                }`}>
                  <Trophy className="w-12 h-12 text-white" />
                </div>

                <div className="pt-8 text-white">
                  <h2 className={`text-6xl font-black italic tracking-tighter uppercase mb-2 ${
                    winnerResult.winner === "python" ? "text-blue-400" : "text-orange-400"
                  }`}>
                    {winnerResult.winner}
                  </h2>
                  <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Takes the Gold!</p>
                </div>

                <div className={`py-6 px-8 rounded-2xl ${
                  winnerResult.winner === winnerResult.betOn ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-red-500/10 border border-red-500/30"
                }`}>
                  <p className="text-xs uppercase font-black text-slate-500 mb-2">Bet Settlement</p>
                  <p className={`text-3xl font-black ${winnerResult.winner === winnerResult.betOn ? "text-emerald-400" : "text-red-400"}`}>
                    {winnerResult.winner === winnerResult.betOn ? `+ $${winnerResult.amount}` : `- $${winnerResult.amount}`}
                  </p>
                </div>

                <button 
                  onClick={resetRace}
                  className="w-full py-5 bg-slate-100 text-slate-950 rounded-2xl font-black text-lg hover:bg-white hover:scale-[1.02] transition-all shadow-xl active:scale-95"
                >
                  PLAY AGAIN
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
