pub fn add_numbers(numbers: &[f64]) -> f64 {
    let mut total = 0.0;

    for number in numbers {
        total += number;
    }

    total
}

pub fn multiply_numbers(numbers: &[f64]) -> f64 {
    let mut product = 1.0;

    for number in numbers {
        product *= number;
    }

    product
}
