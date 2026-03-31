# Calculator

[![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python&logoColor=white)](./Python)
[![Rust](https://img.shields.io/badge/Rust-Edition%202024-black?style=for-the-badge&logo=rust&logoColor=white)](./Rust)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](./.github/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/Tests-Python%20%7C%20Rust-success?style=for-the-badge&logo=checkmarx&logoColor=white)](./.github/workflows/ci.yml)
[![TDD Style](https://img.shields.io/badge/Workflow-TDD%20Style-orange?style=for-the-badge)](#testing-strategy)
[![Benchmark](https://img.shields.io/badge/Benchmark-Rust%20wins%20at%20500x%20input-red?style=for-the-badge)](#current-performance-observation)

A two-language calculator project with matching command-line implementations in Python and Rust, backed by tests, CI, and a Rust-based simulation that benchmarks both programs end to end.

## Highlights

- Matching calculator flows in Python and Rust
- Clear separation between CLI code and reusable logic
- Test-first mindset with coverage around core behavior
- GitHub Actions CI for both languages
- A simulation that compares Python and Rust as full programs, not just raw math functions

## Architecture

The project is split into two independent implementations:

- `Python/` contains the Python calculator CLI and its tests
- `Rust/` contains the Rust calculator library, CLI, tests, and simulation binary

The Rust version is structured a little more formally:

- `src/lib.rs` holds reusable calculator logic
- `src/main.rs` holds the interactive CLI
- `tests/calculator_tests.rs` holds separate integration-style tests
- `src/bin/simulation.rs` holds the Python-vs-Rust performance comparison

That split keeps the business logic testable and prevents the CLI from being tightly coupled to the arithmetic code.

## Testing Strategy

This project follows a TDD-style workflow around the core behaviors:

- define the expected behavior
- write small tests around that behavior
- implement the simplest code that makes the tests pass
- refactor while keeping the tests green

The tests focus on the parts that matter most in a beginner-friendly calculator:

- valid numeric input
- invalid input handling
- empty input safety checks
- correct addition logic
- correct multiplication logic
- main program flow

### Python Test Coverage

The Python test suite checks:

- number collection from mocked user input
- graceful handling of invalid values
- addition and multiplication correctness
- early exit when no numbers are entered
- the main addition and multiplication flows

Run it with:

```bash
cd Python
py -m unittest -q
```

### Rust Test Coverage

The Rust test suite checks:

- addition correctness
- multiplication correctness
- empty-list behavior for both operations

Run it with:

```bash
cd Rust
cargo test
```

## Running the Applications

### Python

```bash
cd Python
py calculator.py
```

### Rust

```bash
cd Rust
cargo run --bin calculator
```

## Performance Simulation

The simulation is implemented in Rust and compares the Python calculator against the Rust calculator by running both as real CLI programs with generated input.

This is important because the comparison includes:

- process startup
- input parsing
- loop execution
- operation selection
- final output path

In other words, this is closer to an end-to-end CLI benchmark than a micro-benchmark of arithmetic alone.

Run it with:

```bash
cd Rust
cargo run --bin simulation
```

## Current Performance Observation

One of the most interesting results in this repository is that the Rust calculator still wins even when it is given dramatically more work than the Python calculator.

Current simulation settings:

- Python numbers: `10`
- Rust numbers: `5000`
- Ratio: Rust processes `500x` more numbers
- Rounds: `5`

Sample run:

```text
Python vs Rust calculator simulation
Python numbers generated: 10
Rust numbers generated: 5000
Rounds per calculator: 5

Addition race
Python numbers: 10
Rust numbers: 5000
Average Python time: 99.17246ms
Average Rust time: 29.85396ms
Rust finished first.

Multiplication race
Python numbers: 10
Rust numbers: 5000
Average Python time: 99.54876ms
Average Rust time: 32.69272ms
Rust finished first.
```

That means the Rust calculator is currently outperforming the Python calculator even while handling 500 times more numeric input in the same simulation.

This does not prove that Rust is always faster in every scenario, but it does show that for this CLI workload, Rust has a very large performance advantage.

## Continuous Integration

The CI workflow in [`.github/workflows/ci.yml`](/C:/Users/OFFICIAL/Desktop/Calculator/.github/workflows/ci.yml) validates both sides of the project:

- Python linting with `ruff`
- Python tests with `unittest`
- Rust tests with `cargo test`

That keeps the project honest across both implementations and makes regressions easier to catch.

## Project Layout

```text
Calculator/
|-- .github/
|   `-- workflows/
|       `-- ci.yml
|-- Python/
|   |-- calculator.py
|   |-- test_calculator.py
|   `-- pyproject.toml
|-- Rust/
|   |-- src/
|   |   |-- bin/
|   |   |   `-- simulation.rs
|   |   |-- lib.rs
|   |   `-- main.rs
|   |-- tests/
|   |   `-- calculator_tests.rs
|   |-- Cargo.toml
|   `-- Cargo.lock
`-- README.md
```

## Engineering Notes

- The Python version optimizes for clarity and beginner readability
- The Rust version adds stronger structure through library and binary separation
- The simulation reuses generated input so comparisons are consistent
- The project intentionally keeps the feature set small so quality, tests, and comparison stay easy to understand
