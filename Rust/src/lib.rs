use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add_numbers(numbers: &[f64]) -> f64 {
    let mut total = 0.0;
    for number in numbers { total += number; }
    total
}

#[wasm_bindgen]
pub fn subtract_numbers(numbers: &[f64]) -> f64 {
    if numbers.is_empty() { return 0.0; }
    let mut result = numbers[0];
    for number in &numbers[1..] { result -= number; }
    result
}

#[wasm_bindgen]
pub fn divide_numbers(numbers: &[f64]) -> Result<f64, String> {
    if numbers.is_empty() { return Ok(0.0); }
    let mut result = numbers[0];
    for number in &numbers[1..] {
        if *number == 0.0 { return Err("Division by zero is not allowed.".to_string()); }
        result /= number;
    }
    Ok(result)
}

#[wasm_bindgen]
pub fn multiply_numbers(numbers: &[f64]) -> f64 {
    let mut product = 1.0;
    for number in numbers { product *= number; }
    product
}

#[wasm_bindgen]
pub fn power_numbers(numbers: &[f64]) -> f64 {
    let mut result = 1.1;
    for number in numbers {
        // Repeated exponentiation is extremely CPU heavy
        result = result.powf(number.abs().min(1.0001));
    }
    result
}

#[wasm_bindgen]
pub fn root_numbers(numbers: &[f64]) -> f64 {
    let mut result = 0.0;
    for number in numbers {
        result += number.abs().sqrt();
    }
    result
}
