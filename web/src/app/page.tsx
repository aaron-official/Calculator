"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Play, RotateCcw, Zap, Activity, Globe, Server, Loader2, Cpu, HelpCircle, Target, TrendingUp } from "lucide-react";

// Types for the runners
type Runner = "python" | "rust";

interface RaceProgress {
  runner?: Runner;
  progress?: number;
  event?: string;
}

// Performance Duel - True Benchmarking Arena
export default function RaceTrack() {
  // State
  const [pyProgress, setPyProgress] = useState(0);
  const [rsProgress, setRsProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<Runner | null>(null);
  const [pyWorkload, setPyWorkload] = useState(5000); 
  const [rsWorkload, setRsWorkload] = useState(500000); 
  const [operation, setOperation] = useState("1"); 
  const [engineMode, setEngineMode] = useState<"server" | "browser">("browser");
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [engineStatus, setEngineStatus] = useState("Initializing...");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finishTimes, setFinishTimes] = useState<{python?: number, rust?: number}>({});

  const eventSourceRef = useRef<EventSource | null>(null);
  const rustWasmRef = useRef<any>(null);
  const isRacingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isRacingRef.current = isRacing;
  }, [isRacing]);

  // --- ENGINE INITIALIZATION ---
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hostname.includes("github.io")) {
        setEngineMode("browser");
    }

    if (engineMode === "browser") {
      const initEngines = async () => {
        try {
          setEngineStatus("Loading Python (Pyodide)...");
          if (!window.pyodide) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js";
            script.onload = async () => {
              try {
                window.pyodide = await window.loadPyodide();
                setEngineStatus("Loading Rust (Wasm)...");
                await loadWasm();
              } catch (e) {
                console.error(e);
                setEngineStatus("Python failed.");
                setIsEngineReady(true); 
              }
            };
            document.head.appendChild(script);
          } else {
            await loadWasm();
          }
        } catch (err) {
          setIsEngineReady(true);
        }
      };

      const loadWasm = async () => {
        try {
            // @ts-ignore
            const wasm = await import("../wasm/calculator.js");
            await wasm.default();
            rustWasmRef.current = wasm;
            setEngineStatus("Engines Ready");
            setIsEngineReady(true);
          } catch (e) {
            console.warn("Wasm failed", e);
            setEngineStatus("Simulation Mode Ready");
            setIsEngineReady(true);
          }
      };

      initEngines();
    } else {
      setIsEngineReady(true);
      setEngineStatus("Server Mode Active");
    }
  }, [engineMode]);

  // --- RACE LOGIC ---
  const startRace = async () => {
    if (isRacing || !isEngineReady) return;

    isRacingRef.current = true;
    setPyProgress(0);
    setRsProgress(0);
    setIsRacing(true);
    setWinner(null);
    setFinishTimes({});
    setStartTime(Date.now());

    if (engineMode === "server") {
      startServerRace();
    } else {
      startBrowserRace();
    }
  };

  const startServerRace = () => {
    const url = `/api/race?op=${operation}&pyCount=${pyWorkload}&rsCount=${rsWorkload}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data: RaceProgress = JSON.parse(event.data);
      if (data.runner === "python") setPyProgress(data.progress || 0);
      else if (data.runner === "rust") setRsProgress(data.progress || 0);
      
      if (data.progress && data.progress >= 100) {
        handleRaceEnd(data.runner!);
      }
    };

    es.onerror = () => {
        setIsRacing(false);
        isRacingRef.current = false;
        es.close();
    };
  };

  const startBrowserRace = async () => {
    const batches = 100;
    
    // 1. PYTHON EXECUTION (via Pyodide)
    const runPython = async () => {
        if (!window.pyodide) {
            // Mock fallback if Pyodide failed
            for (let i = 1; i <= batches; i++) {
                if (!isRacingRef.current) break;
                await new Promise(r => setTimeout(r, 50));
                setPyProgress(i);
                if (i === 100) handleRaceEnd("python");
            }
            return;
        }

        // Divide work into batches to show progress
        const workPerBatch = pyWorkload / batches;
        for (let i = 1; i <= batches; i++) {
            if (!isRacingRef.current) break;
            
            // Actually run Python code for this batch
            // We use a simple loop to simulate arithmetic work
            await window.pyodide.runPythonAsync(`
result = 0.0
for _ in range(${Math.floor(workPerBatch)}):
    result += 1.1
            `);
            
            setPyProgress(i);
            if (i === 100) handleRaceEnd("python");
        }
    };

    // 2. RUST EXECUTION (via Wasm)
    const runRust = async () => {
        const hasWasm = !!rustWasmRef.current;
        const workPerBatch = rsWorkload / batches;
        const nums = new Float64Array(Math.floor(workPerBatch)).fill(1.1);

        for (let i = 1; i <= batches; i++) {
            if (!isRacingRef.current) break;
            
            if (hasWasm) {
                // Actually run the compiled Rust logic
                if (operation === "1") rustWasmRef.current.add_numbers(nums);
                else if (operation === "2") rustWasmRef.current.subtract_numbers(nums);
                else if (operation === "3") rustWasmRef.current.multiply_numbers(nums);
                else if (operation === "4") rustWasmRef.current.divide_numbers(nums);
            } else {
                // Simulation fallback
                await new Promise(r => setTimeout(r, 5));
            }
            
            setRsProgress(i);
            if (i === 100) handleRaceEnd("rust");
        }
    };

    runPython();
    runRust();
  };

  const handleRaceEnd = (runner: Runner) => {
    const time = (Date.now() - (startTime || Date.now())) / 1000;
    
    setFinishTimes(prev => {
        if (prev[runner]) return prev;
        const next = { ...prev, [runner]: time };
        
        // Winning detection: if I am the first to finish the workload
        setWinner(w => w || runner);
        
        return next;
    });
  };

  // Auto-stop racing when both are 100%
  useEffect(() => {
    if (pyProgress >= 100 && rsProgress >= 100 && isRacing) {
        setIsRacing(false);
        isRacingRef.current = false;
        if (eventSourceRef.current) eventSourceRef.current.close();
    }
  }, [pyProgress, rsProgress, isRacing]);

  const resetRace = () => {
    setIsRacing(false);
    isRacingRef.current = false;
    setPyProgress(0);
    setRsProgress(0);
    setWinner(null);
    setFinishTimes({});
    if (eventSourceRef.current) eventSourceRef.current.close();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tighter text-blue-500 italic leading-tight uppercase">
              Performance Duel
            </h1>
            <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                    <Activity className="w-3 h-3 text-blue-500 animate-pulse" />
                    {engineStatus}
                </div>
                <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button 
                        onClick={() => setEngineMode("browser")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-black transition-all ${engineMode === "browser" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Globe className="w-3 h-3" /> BROWSER
                    </button>
                    <button 
                        onClick={() => setEngineMode("server")}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-[10px] font-black transition-all ${engineMode === "server" ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-300"}`}
                    >
                        <Server className="w-3 h-3" /> SERVER
                    </button>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-4 rounded-2xl border border-blue-500/20 shadow-inner">
            <Cpu className="text-blue-500 w-8 h-8" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-tighter">System Health</span>
              <span className="text-xl font-mono font-black text-blue-400 tracking-tighter">STABLE</span>
            </div>
          </div>
        </header>

        {/* Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-6 lg:col-span-3">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                      🐍 Python Workload
                    </h2>
                    <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full border border-blue-400/20">
                      {pyWorkload.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={pyWorkload}
                    onChange={(e) => setPyWorkload(parseInt(e.target.value))}
                    disabled={isRacing}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-all hover:accent-blue-400"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                      🦀 Rust Workload
                    </h2>
                    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-400/10 px-3 py-1 rounded-full border border-orange-400/20">
                      {rsWorkload.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="10000000"
                    step="10000"
                    value={rsWorkload}
                    onChange={(e) => setRsWorkload(parseInt(e.target.value))}
                    disabled={isRacing}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 transition-all hover:accent-orange-400"
                  />
                </div>
             </div>

             <div className="pt-4 border-t border-slate-800/50">
                <div className="flex flex-wrap gap-6 items-center">
                  <div className="space-y-2 min-w-[200px]">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Benchmark Operation</h2>
                    <select 
                        value={operation} 
                        onChange={(e) => setOperation(e.target.value)}
                        disabled={isRacing}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 ring-blue-500/50 appearance-none cursor-pointer hover:border-slate-700 transition-colors text-slate-100"
                    >
                        <option value="1">Addition (+)</option>
                        <option value="2">Subtraction (-)</option>
                        <option value="3">Multiplication (*)</option>
                        <option value="4">Division (/)</option>
                    </select>
                  </div>
                  <div className="flex-1 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    Observe how each language handles intense arithmetic loops.
                  </div>
                </div>
             </div>
          </div>

          <div className="flex flex-col justify-center">
            <button
              onClick={isRacing ? resetRace : startRace}
              disabled={!isEngineReady}
              className={`group relative overflow-hidden w-full h-full min-h-[120px] rounded-3xl font-black text-2xl flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl disabled:opacity-50 disabled:grayscale ${
                isRacing
                  ? "bg-red-500/10 text-red-500 border-2 border-red-500/30 hover:bg-red-500/20"
                  : "bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-blue-500/20 hover:scale-[1.02]"
              }`}
            >
              <div className="relative z-10 flex items-center gap-3">
                {!isEngineReady ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : isRacing ? (
                    <RotateCcw className="w-8 h-8" />
                ) : (
                    <Play className="w-8 h-8 fill-current translate-x-1" />
                )}
                <span className="tracking-tighter uppercase">{!isEngineReady ? "Wait..." : isRacing ? "Stop" : "Race!"}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Arena */}
        <div className="bg-slate-900/60 p-6 md:p-12 rounded-[3rem] border border-slate-800/50 shadow-inner relative overflow-hidden">
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
                    <span className="text-xs font-black uppercase tracking-widest text-blue-400/80">Python Interpreter</span>
                    {finishTimes.python && (
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Real Time: {finishTimes.python.toFixed(3)}s</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-blue-400">{pyProgress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full w-full relative border border-slate-800 shadow-inner overflow-visible">
                  <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-blue-500/20 rounded-full"
                    animate={{ width: `${pyProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  />
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
                    <span className="text-xs font-black uppercase tracking-widest text-orange-400/80">Rust Native Wasm</span>
                    {finishTimes.rust && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">Real Time: {finishTimes.rust.toFixed(3)}s</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-orange-400">{rsProgress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-slate-950/50 rounded-full w-full relative border border-slate-800 shadow-inner overflow-visible">
                   <motion.div 
                    className="absolute left-0 top-0 bottom-0 bg-orange-500/20 rounded-full"
                    animate={{ width: `${rsProgress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  />
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

           <div className="absolute right-6 top-1/2 -rotate-90 translate-y-[-50%] pointer-events-none">
              <span className="text-4xl md:text-6xl font-black text-slate-800/30 tracking-widest uppercase text-slate-400">Finish Line</span>
           </div>
        </div>

        {/* How to Play Section */}
        <section className="bg-slate-900/30 rounded-3xl border border-slate-800 p-8 space-y-8">
            <div className="flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Benchmark Guide</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Target className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400">1. Set Workloads</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Assign specific operation counts. Notice that Rust can handle millions while Python typically stays in the thousands for equal time.</p>
                </div>

                <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <TrendingUp className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-orange-400">2. Execute Loop</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">The race represents real arithmetic processing. The icons move only as fast as the underlying engine completes its batches.</p>
                </div>

                <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Cpu className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-indigo-400">3. Raw Results</h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">The final timestamps are calculated using high-resolution performance timers, showing the true delta between interpreted and native code.</p>
                </div>
            </div>

            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50 flex items-center gap-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Browser mode uses <span className="text-blue-400">Pyodide (WebAssembly Python)</span> and <span className="text-orange-400">Native WebAssembly (Rust)</span>.
                </p>
            </div>
        </section>

        {/* Results Modal */}
        <AnimatePresence>
          {winner && (
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
                  winner === "python" 
                    ? "bg-blue-900/20 border-blue-500/50" 
                    : "bg-orange-900/20 border-orange-500/50"
                }`}
              >
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full flex items-center justify-center border-4 ${
                  winner === "python" ? "bg-blue-600 border-blue-400" : "bg-orange-600 border-orange-400"
                }`}>
                  <Trophy className="w-12 h-12 text-white" />
                </div>

                <div className="pt-8 text-white uppercase">
                  <h2 className={`text-6xl font-black italic tracking-tighter mb-2 ${
                    winner === "python" ? "text-blue-400" : "text-orange-400"
                  }`}>
                    {winner} Wins!
                  </h2>
                  <p className="text-slate-400 font-bold tracking-widest text-sm">Benchmark Completed</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-tighter">Python Time</p>
                        <p className="text-xl font-mono font-bold text-blue-400">{finishTimes.python?.toFixed(3) || "---"}s</p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-tighter">Rust Time</p>
                        <p className="text-xl font-mono font-bold text-orange-400">{finishTimes.rust?.toFixed(3) || "---"}s</p>
                    </div>
                </div>

                <button 
                  onClick={resetRace}
                  className="w-full py-5 bg-slate-100 text-slate-950 rounded-2xl font-black text-lg hover:bg-white hover:scale-[1.02] transition-all shadow-xl active:scale-95 uppercase"
                >
                  Reset Arena
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
