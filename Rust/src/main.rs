use std::io::{self, Write};

use calculator::{add_numbers, multiply_numbers, subtract_numbers};

fn get_numbers() -> Vec<f64> {
    let mut numbers = Vec::new();

    loop {
        print!("Enter a number (or 'done' to finish): ");
        io::stdout().flush().expect("Failed to flush stdout");

        let mut input = String::new();
        io::stdin()
            .read_line(&mut input)
            .expect("Failed to read input");

        let trimmed_input = input.trim();

        if trimmed_input.eq_ignore_ascii_case("done") {
            break;
        }

        match trimmed_input.parse::<f64>() {
            Ok(number) => numbers.push(number),
            Err(_) => println!("Invalid input. Please enter a number or 'done'."),
        }
    }

    numbers
}

fn main() {
    println!("Welcome to the simple calculator!");

    let numbers = get_numbers();

    if numbers.is_empty() {
        println!("No numbers were entered. Exiting the program.");
        return;
    }

    println!("\nChoose an operation:");
    println!("1. Addition");
    println!("2. Subtraction");
    println!("3. Multiplication");
    print!("Enter your choice (1, 2, or 3): ");
    io::stdout().flush().expect("Failed to flush stdout");

    let mut choice = String::new();
    io::stdin()
        .read_line(&mut choice)
        .expect("Failed to read input");

    if choice.trim() == "1" {
        let total = add_numbers(&numbers);
        println!("The sum is: {}", total);
    } else if choice.trim() == "2" {
        let result = subtract_numbers(&numbers);
        println!("The result is: {}", result);
    } else if choice.trim() == "3" {
        let product = multiply_numbers(&numbers);
        println!("The product is: {}", product);
    } else {
        println!("Invalid choice. Please run the program again and choose 1, 2, or 3.");
    }
}
