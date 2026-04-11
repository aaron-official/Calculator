# 🏁 Performance Duel: Python vs Rust

[![Static Site](https://img.shields.io/badge/Live-GitHub%20Pages-blue?style=for-the-badge&logo=github)](https://aaron-official.github.io/Calculator/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](./Dockerfile)
[![Wasm](https://img.shields.io/badge/Engine-WebAssembly-orange?style=for-the-badge&logo=webassembly)](./Rust)
[![Pyodide](https://img.shields.io/badge/Engine-Pyodide-yellow?style=for-the-badge&logo=python)](./Python)

Welcome to **Performance Duel**, a gamified benchmarking arena where the classic Python vs Rust rivalry is settled on the race track. What started as a simple calculator is now a high-stakes betting game powered by cutting-edge web technologies.

## 🎮 The Game

In **Performance Duel**, you bet on which language can process a massive workload of arithmetic operations the fastest.

### Key Features
- **Hybrid Racing Engines:** 
  - **Browser Mode:** Executes Rust via **WebAssembly** and Python via **Pyodide** directly in your browser tab. No server required!
  - **Server Mode:** Leverages **Docker** and a Next.js API to run native binaries for maximum raw performance.
- **Dynamic Odds System:** Adjust the "Hardware Handicap" for Rust or the "Python Workload." The more lopsided the workload, the higher the payout multiplier for the underdog!
- **The Betting Arena:** Start with $1,000 and try to grow your balance. But beware...
- **The House Always Wins:** Experience gritty realism with a rigging engine that subtly sabotages runners when the stakes are too high.

## 🛠 Technical Architecture

This project demonstrates a unique multi-language stack working in harmony:

- **Rust Engine (`/Rust`):** 
  - Compiled to a native binary for the CLI and Server Mode.
  - Compiled to **WebAssembly (Wasm)** using `wasm-pack` for lightning-fast browser execution.
- **Python Engine (`/Python`):**
  - Run via `uv` for local CLI and Server Mode.
  - Executed via **Pyodide** in the browser, allowing real Python scripts to run in a sandboxed environment.
- **Frontend (`/web`):**
  - Built with **Next.js 15 (App Router)** and **Tailwind CSS v4**.
  - Uses **Framer Motion** for smooth, high-fidelity race animations.
  - Orchestrates real-time progress updates via **Server-Sent Events (SSE)** in Server Mode.

## 🚀 How to Run

### 1. In the Browser (Easiest)
Visit the live site: [aaron-official.github.io/Calculator/](https://aaron-official.github.io/Calculator/)

### 2. Local Development
```bash
# Install dependencies
cd web
npm install

# Run the dev server
npm run dev
```
*Note: Browser mode will detect your environment and load the Wasm/Pyodide engines automatically.*

### 3. Native CLI
You can still run the engines manually in your terminal:
```bash
# Rust
cd Rust
cargo run -- --batch 1 50000 100 0

# Python
cd Python
uv run python calculator.py --batch 1 1000 100 0
```

## 🐳 Docker Deployment

The project is fully dockerized for deployment to platforms like Render, AWS, or Railway.

```bash
docker build -t performance-duel .
docker run -p 3000:3000 performance-duel
```

## 🤖 Continuous Integration

Our GitHub Actions workflow handles the heavy lifting:
1. **Validates** logic with Python and Rust unit tests.
2. **Compiles** Rust to WebAssembly.
3. **Builds** the Next.js static export.
4. **Deploys** the game automatically to **GitHub Pages**.
5. **Verifies** the production **Docker** build.

---
*Created as a class project to explore the performance characteristics of interpreted vs compiled languages.*
