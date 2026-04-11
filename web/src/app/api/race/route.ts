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

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Spawn Python
      const pythonProc = spawn("uv", ["run", "python", "calculator.py", "--batch", operation, pythonCount, batches], {
        cwd: pythonPath,
      });

      // Spawn Rust
      const isProduction = process.env.NODE_ENV === "production";
      const rustProc = isProduction
        ? spawn("./calculator", ["--batch", operation, rustCount, batches], {
            cwd: rustPath,
          })
        : spawn("cargo", ["run", "--quiet", "--bin", "calculator", "--", "--batch", operation, rustCount, batches], {
            cwd: rustPath,
          });

      pythonProc.stdout.on("data", (data) => {
        const line = data.toString().trim();
        const lines = line.split("\n");
        for (const l of lines) {
            if (l.startsWith("PROGRESS:")) {
                send({ runner: "python", progress: parseFloat(l.split(":")[1]) });
            } else if (l.startsWith("RESULT:SUCCESS:")) {
                send({ runner: "python", time: parseFloat(l.split(":")[2]) });
            }
        }
      });

      rustProc.stdout.on("data", (data) => {
        const line = data.toString().trim();
        const lines = line.split("\n");
        for (const l of lines) {
            if (l.startsWith("PROGRESS:")) {
                send({ runner: "rust", progress: parseFloat(l.split(":")[1]) });
            } else if (l.startsWith("RESULT:SUCCESS:")) {
                send({ runner: "rust", time: parseFloat(l.split(":")[2]) });
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
