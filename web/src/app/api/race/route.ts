import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operation = searchParams.get("op") || "1";
  const pythonCount = searchParams.get("pyCount") || "1000";
  const rustCount = searchParams.get("rsCount") || "50000";
  const betOn = searchParams.get("betOn") || "";
  const batches = "100";

  const pythonPath = path.resolve(process.cwd(), "..", "Python");
  const rustPath = path.resolve(process.cwd(), "..", "Rust");

  // Base delays for ~40s race
  let pyDelay = 400; 
  let rsDelay = 380;

  // --- THE HOUSE ALWAYS WINS (Rigging Logic) ---
  // 75% chance to sabotage the player's choice
  const shouldRig = Math.random() < 0.75;
  
  if (shouldRig && betOn) {
    if (betOn === "python") {
      // User bet on Python, make Python slower or Rust faster
      pyDelay += Math.floor(Math.random() * 40) + 20; // +20-60ms
      rsDelay -= Math.floor(Math.random() * 20) + 10; // -10-30ms
    } else if (betOn === "rust") {
      // User bet on Rust, make Rust slower or Python faster
      rsDelay += Math.floor(Math.random() * 40) + 20; 
      pyDelay -= Math.floor(Math.random() * 20) + 10;
    }
  } else if (!shouldRig && betOn) {
    // 25% chance to give a "Nitro Boost" to the player's choice (to keep them hooked)
    if (betOn === "python") {
      pyDelay -= 30;
    } else {
      rsDelay -= 30;
    }
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Spawn Python with rigged delay
      const pythonProc = spawn("uv", ["run", "python", "calculator.py", "--batch", operation, pythonCount, batches, pyDelay.toString()], {
        cwd: pythonPath,
      });

      // Spawn Rust with rigged delay
      // Spawn Rust
      // In production/Docker, we use the compiled binary directly for speed
      const isProduction = process.env.NODE_ENV === "production";
      const rustProc = isProduction
        ? spawn("./calculator", ["--batch", operation, rustCount, batches, rsDelay.toString()], {
            cwd: rustPath,
          })
        : spawn("cargo", ["run", "--quiet", "--bin", "calculator", "--", "--batch", operation, rustCount, batches, rsDelay.toString()], {
            cwd: rustPath,
          });
      pythonProc.stdout.on("data", (data) => {
        const line = data.toString().trim();
        if (line.startsWith("PROGRESS:")) {
          send({ runner: "python", progress: parseFloat(line.split(":")[1]) });
        }
      });

      rustProc.stdout.on("data", (data) => {
        const line = data.toString().trim();
        if (line.startsWith("PROGRESS:")) {
          send({ runner: "rust", progress: parseFloat(line.split(":")[1]) });
        }
      });

      let finished = 0;
      const checkFinished = () => {
        finished++;
        if (finished === 2) {
          send({ event: "complete" });
          controller.close();
        }
      };

      pythonProc.on("close", checkFinished);
      rustProc.on("close", checkFinished);

      pythonProc.stderr.on("data", (data) => console.error(`Python Error: ${data}`));
      rustProc.stderr.on("data", (data) => console.error(`Rust Error: ${data}`));

      req.signal.addEventListener("abort", () => {
        pythonProc.kill();
        rustProc.kill();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
