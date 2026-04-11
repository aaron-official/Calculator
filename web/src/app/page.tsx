"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, FastForward, Play, RotateCcw, Coins, ShieldCheck, Zap } from "lucide-react";

type Runner = "python" | "rust";

interface RaceProgress {
  runner?: Runner;
  progress?: number;
  event?: string;
}

export default function RaceTrack() {
  const [pyProgress, setPyProgress] = useState(0);
  const [rsProgress, setRsProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<Runner | null>(null);
  const [betOn, setBetOn] = useState<Runner | null>(null);
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(100);
  const [handicap, setHandicap] = useState(50000); // Rust's extra work
  const [operation, setOperation] = useState("1"); // 1=Add

  const eventSourceRef = useRef<EventSource | null>(null);

  const startRace = () => {
    if (isRacing || !betOn) return;

    setPyProgress(0);
    setRsProgress(0);
    setIsRacing(true);
    setWinner(null);

    const url = `/api/race?op=${operation}&pyCount=1000&rsCount=${handicap}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data: RaceProgress = JSON.parse(event.data);

      if (data.runner === "python") {
        setPyProgress(data.progress || 0);
      } else if (data.runner === "rust") {
        setRsProgress(data.progress || 0);
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

  useEffect(() => {
    if (pyProgress >= 100 && !winner) {
      setWinner("python");
    } else if (rsProgress >= 100 && !winner) {
      setWinner("rust");
    }
  }, [pyProgress, rsProgress, winner]);

  useEffect(() => {
    if (winner) {
      if (winner === betOn) {
        setBalance((prev) => prev + betAmount);
      } else {
        setBalance((prev) => prev - betAmount);
      }
    }
  }, [winner]);

  const resetRace = () => {
    setPyProgress(0);
    setRsProgress(0);
    setWinner(null);
    setIsRacing(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header & Balance */}
        <header className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic">
              PERFORMANCE DUEL
            </h1>
            <p className="text-slate-400 text-sm font-medium">Python vs Rust: The Ultimate Race</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950 px-5 py-3 rounded-xl border border-yellow-500/30">
            <Coins className="text-yellow-500 w-6 h-6" />
            <span className="text-2xl font-mono font-bold text-yellow-500">${balance}</span>
          </div>
        </header>

        {/* Betting Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Place Your Bet
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBetOn("python")}
                disabled={isRacing}
                className={`py-3 rounded-xl font-bold transition-all ${
                  betOn === "python"
                    ? "bg-blue-600 text-white ring-2 ring-blue-400"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Python 🐍
              </button>
              <button
                onClick={() => setBetOn("rust")}
                disabled={isRacing}
                className={`py-3 rounded-xl font-bold transition-all ${
                  betOn === "rust"
                    ? "bg-orange-600 text-white ring-2 ring-orange-400"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                Rust 🦀
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
               <Zap className="w-4 h-4" /> Rust Handicap
            </h2>
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={handicap}
              onChange={(e) => setHandicap(parseInt(e.target.value))}
              disabled={isRacing}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Fair</span>
              <span className="text-orange-400 font-bold">{handicap.toLocaleString()} numbers</span>
              <span>Extreme</span>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-end">
            <button
              onClick={isRacing ? resetRace : startRace}
              disabled={!betOn}
              className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all ${
                isRacing
                  ? "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20"
                  : "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-95"
              }`}
            >
              {isRacing ? <RotateCcw className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
              {isRacing ? "ABORT" : "FIGHT!"}
            </button>
          </div>
        </div>

        {/* The Track */}
        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
           {/* Finish Line */}
           <div className="absolute right-12 top-0 bottom-0 w-4 bg-slate-800 flex flex-col justify-around py-4 opacity-50">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`w-full h-4 ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`} />
              ))}
           </div>

           <div className="space-y-12 relative z-10">
              {/* Python Lane */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-400">
                  <span>Python v3.12 (Snake Engine)</span>
                  <span>{pyProgress.toFixed(1)}%</span>
                </div>
                <div className="h-12 bg-slate-950 rounded-full border border-slate-800 p-1 relative">
                  <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: `${Math.min(pyProgress, 95)}%` }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute top-1 bottom-1 w-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40"
                  >
                    <span className="text-2xl">🐍</span>
                  </motion.div>
                </div>
              </div>

              {/* Rust Lane */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-orange-400">
                  <span>Rust 2024 (Ferris Boost)</span>
                  <span>{rsProgress.toFixed(1)}%</span>
                </div>
                <div className="h-12 bg-slate-950 rounded-full border border-slate-800 p-1 relative">
                  <motion.div 
                    initial={{ x: 0 }}
                    animate={{ x: `${Math.min(rsProgress, 95)}%` }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute top-1 bottom-1 w-10 bg-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-orange-900/40"
                  >
                    <span className="text-2xl">🦀</span>
                  </motion.div>
                </div>
              </div>
           </div>
        </div>

        {/* Results Overlay */}
        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`p-8 rounded-3xl border-2 text-center space-y-4 shadow-2xl ${
                winner === "python" 
                  ? "bg-blue-500/10 border-blue-500/50" 
                  : "bg-orange-500/10 border-orange-500/50"
              }`}
            >
              <Trophy className={`w-16 h-16 mx-auto ${winner === "python" ? "text-blue-400" : "text-orange-400"}`} />
              <h2 className="text-4xl font-black uppercase italic italic">
                {winner === "python" ? "Python" : "Rust"} Wins!
              </h2>
              <p className="text-xl font-medium text-slate-400">
                {winner === betOn ? (
                  <span className="text-emerald-400 font-bold">SUCCESSFUL BET! +${betAmount}</span>
                ) : (
                  <span className="text-red-400 font-bold">BET LOST! -${betAmount}</span>
                )}
              </p>
              <button 
                onClick={resetRace}
                className="px-8 py-3 bg-slate-100 text-slate-950 rounded-xl font-bold hover:bg-white transition-colors"
              >
                CONTINUE
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
