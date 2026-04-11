import { NextRequest } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const operation = searchParams.get("op") || "1";
  const pythonCount = searchParams.get("pyCount") || "1000";
  const rustCount = searchParams.get("rsCount") || "50000";
  const batches = "100";

  const pythonPath = path.resolve(process.cwd(), "..", "Python");
  const rustPath = path.resolve(process.cwd(), "..", "Rust");

  // TRUE BENCHMARKING: No artificial delays
  const delay = "0"; 

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Spawn Python
      const pythonProc = spawn("uv", ["run", "python", "calculator.py", "--batch", operation, pythonCount, batches, delay], {
        cwd: pythonPath,
      });

      // Spawn Rust
      const rustProc = spawn("cargo", ["run", "--quiet", "--bin", "calculator", "--", "--batch", operation, rustCount, batches, delay], {
        cwd: rustPath,
      });

      pythonProc.stdout.on("data", (data) => {
        const line = data.toString().trim();
        // Handle multiple lines in one buffer
        const lines = line.split("\n");
        for (const l of lines) {
            if (l.startsWith("PROGRESS:")) {
                send({ runner: "python", progress: parseFloat(l.split(":")[1]) });
            }
        }
      });

      rustProc.stdout.on("data", (data) => {
        const line = data.toString().trim();
        const lines = line.split("\n");
        for (const l of lines) {
            if (l.startsWith("PROGRESS:")) {
                send({ runner: "rust", progress: parseFloat(l.split(":")[1]) });
            }
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
