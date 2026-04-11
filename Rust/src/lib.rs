pub fn add_numbers(numbers: &[f64]) -> f64 {
    let mut total = 0.0;

    for number in numbers {
        total += number;
    }

    total
}

pub fn subtract_numbers(numbers: &[f64]) -> f64 {
    if numbers.is_empty() {
        return 0.0;
    }

    let mut result = numbers[0];

    for number in &numbers[1..] {
        result -= number;
    }

    result
}

pub fn divide_numbers(numbers: &[f64]) -> Result<f64, String> {
    if numbers.is_empty() {
        return Ok(0.0);
    }

    let mut result = numbers[0];

    for number in &numbers[1..] {
        if *number == 0.0 {
            return Err("Division by zero is not allowed.".to_string());
        }
        result /= number;
    }

    Ok(result)
}

pub fn multiply_numbers(numbers: &[f64]) -> f64 {
    let mut product = 1.0;

    for number in numbers {
        product *= number;
    }

    product
}
