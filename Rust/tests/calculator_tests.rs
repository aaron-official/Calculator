use calculator::{add_numbers, multiply_numbers, subtract_numbers};

#[test]
fn add_numbers_returns_total() {
    let numbers = vec![2.0, 3.0, 5.0];
    assert_eq!(add_numbers(&numbers), 10.0);
}

#[test]
fn subtract_numbers_returns_result() {
    let numbers = vec![10.0, 2.0, 3.0];
    assert_eq!(subtract_numbers(&numbers), 5.0);
}

#[test]
fn multiply_numbers_returns_product() {
    let numbers = vec![2.0, 3.0, 5.0];
    assert_eq!(multiply_numbers(&numbers), 30.0);
}

#[test]
fn add_numbers_handles_empty_list() {
    let numbers: Vec<f64> = vec![];
    assert_eq!(add_numbers(&numbers), 0.0);
}

#[test]
fn subtract_numbers_handles_empty_list() {
    let numbers: Vec<f64> = vec![];
    assert_eq!(subtract_numbers(&numbers), 0.0);
}

#[test]
fn multiply_numbers_handles_empty_list() {
    let numbers: Vec<f64> = vec![];
    assert_eq!(multiply_numbers(&numbers), 1.0);
}
