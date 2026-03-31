use std::env::consts::EXE_SUFFIX;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

const RUST_NUMBER_COUNT: usize = 5000;
const PYTHON_NUMBER_COUNT: usize = 10;
const ROUNDS: usize = 5;
const SEED: u64 = 42;

fn generate_numbers(count: usize, mut seed: u64) -> Vec<f64> {
    let mut numbers = Vec::with_capacity(count);

    for _ in 0..count {
        seed = seed.wrapping_mul(1_664_525).wrapping_add(1_013_904_223);
        let value = (seed % 99) as f64 / 100.0 + 0.01;
        numbers.push(value);
    }

    numbers
}

fn build_input(numbers: &[f64], choice: &str) -> String {
    let mut input = String::new();

    for number in numbers {
        input.push_str(&format!("{number}\n"));
    }

    input.push_str("done\n");
    input.push_str(choice);
    input.push('\n');

    input
}

fn average_duration(total: Duration, rounds: usize) -> Duration {
    Duration::from_secs_f64(total.as_secs_f64() / rounds as f64)
}

fn ensure_rust_calculator_binary(project_dir: &Path) -> PathBuf {
    let status = Command::new("cargo")
        .args(["build", "--bin", "calculator"])
        .current_dir(project_dir)
        .status()
        .expect("Failed to build the Rust calculator");

    if !status.success() {
        panic!("Rust calculator build failed");
    }

    project_dir
        .join("target")
        .join("debug")
        .join(format!("calculator{EXE_SUFFIX}"))
}

fn run_command(mut command: Command, input: &str) -> Duration {
    command.stdin(Stdio::piped());
    command.stdout(Stdio::null());
    command.stderr(Stdio::null());

    let start = Instant::now();
    let mut child = command.spawn().expect("Failed to start program");

    let mut stdin = child.stdin.take().expect("Failed to open stdin");
    stdin
        .write_all(input.as_bytes())
        .expect("Failed to send input to program");
    drop(stdin);

    let status = child.wait().expect("Failed to wait for program");

    if !status.success() {
        panic!("Program exited with an error");
    }

    start.elapsed()
}

fn run_python_calculator(python_script: &Path, input: &str) -> Duration {
    let mut command = Command::new("py");
    command.arg(python_script);

    run_command(command, input)
}

fn run_rust_calculator(rust_binary: &Path, input: &str) -> Duration {
    let command = Command::new(rust_binary);
    run_command(command, input)
}

fn compare_programs(
    operation_name: &str,
    choice: &str,
    python_numbers: &[f64],
    rust_numbers: &[f64],
    python_script: &Path,
    rust_binary: &Path,
) {
    let python_input = build_input(python_numbers, choice);
    let rust_input = build_input(rust_numbers, choice);
    let mut python_total = Duration::ZERO;
    let mut rust_total = Duration::ZERO;

    for _ in 0..ROUNDS {
        python_total += run_python_calculator(python_script, &python_input);
        rust_total += run_rust_calculator(rust_binary, &rust_input);
    }

    println!("\n{operation_name} race");
    println!("Python numbers: {}", python_numbers.len());
    println!("Rust numbers: {}", rust_numbers.len());
    println!(
        "Average Python time: {:?}",
        average_duration(python_total, ROUNDS)
    );
    println!(
        "Average Rust time: {:?}",
        average_duration(rust_total, ROUNDS)
    );

    if python_total < rust_total {
        println!("Python finished first.");
    } else if rust_total < python_total {
        println!("Rust finished first.");
    } else {
        println!("They finished at the same speed.");
    }
}

fn main() {
    let rust_project_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let calculator_root = rust_project_dir
        .parent()
        .expect("Expected Rust project to be inside the Calculator folder");
    let python_script = calculator_root.join("Python").join("calculator.py");
    let rust_binary = ensure_rust_calculator_binary(rust_project_dir);
    let rust_numbers = generate_numbers(RUST_NUMBER_COUNT, SEED);
    let python_numbers = rust_numbers[..PYTHON_NUMBER_COUNT].to_vec();

    println!("Python vs Rust calculator simulation");
    println!("Python numbers generated: {}", PYTHON_NUMBER_COUNT);
    println!("Rust numbers generated: {}", RUST_NUMBER_COUNT);
    println!("Rounds per calculator: {}", ROUNDS);

    compare_programs(
        "Addition",
        "1",
        &python_numbers,
        &rust_numbers,
        &python_script,
        &rust_binary,
    );
    compare_programs(
        "Multiplication",
        "2",
        &python_numbers,
        &rust_numbers,
        &python_script,
        &rust_binary,
    );
}
