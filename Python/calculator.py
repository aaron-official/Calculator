"""A simple calculator CLI app."""

import sys
import time
import math


def get_numbers():
    """Collect numbers from the user until they type 'done'."""
    numbers = []
    while True:
        user_input = input("Enter a number (or 'done' to finish): ").strip()
        if user_input.lower() == "done": break
        try:
            number = float(user_input)
            numbers.append(number)
        except ValueError:
            print("Invalid input. Please enter a number or 'done'.")
    return numbers


def add_numbers(numbers):
    total = 0
    for number in numbers: total += number
    return total


def subtract_numbers(numbers):
    if not numbers: return 0
    result = numbers[0]
    for number in numbers[1:]: result -= number
    return result


def divide_numbers(numbers):
    if not numbers: return 0
    result = numbers[0]
    for number in numbers[1:]:
        if number == 0: raise ValueError("Division by zero is not allowed.")
        result /= number
    return result


def multiply_numbers(numbers):
    product = 1
    for number in numbers: product *= number
    return product


def power_numbers(numbers):
    result = 1.1
    for number in numbers:
        result = math.pow(result, min(abs(number), 1.0001))
    return result


def root_numbers(numbers):
    result = 0.0
    for number in numbers:
        result += math.sqrt(abs(number))
    return result


def main():
    """Run the calculator program."""
    if len(sys.argv) > 1 and sys.argv[1] == "--batch":
        try:
            op = sys.argv[2]
            count = int(sys.argv[3])
            batches = int(sys.argv[4])
        except (IndexError, ValueError):
            return

        start_time = time.perf_counter()
        for i in range(batches):
            numbers = [1.1] * (count // batches)
            if op == "1": add_numbers(numbers)
            elif op == "2": subtract_numbers(numbers)
            elif op == "3": multiply_numbers(numbers)
            elif op == "4": 
                try: divide_numbers(numbers)
                except ValueError: pass
            elif op == "5": power_numbers(numbers)
            elif op == "6": root_numbers(numbers)

            print(f"PROGRESS:{((i + 1) / batches) * 100:.2f}")
            sys.stdout.flush()

        end_time = time.perf_counter()
        print(f"RESULT:SUCCESS:{end_time - start_time:.6f}")
        return

    print("Welcome to the simple calculator!")
    numbers = get_numbers()
    if not numbers: return

    print("\nChoose an operation:")
    print("1. Addition")
    print("2. Subtraction")
    print("3. Multiplication")
    print("4. Division")
    print("5. Exponents (Heavy)")
    print("6. Square Roots (Medium)")

    choice = input("Enter your choice (1-6): ").strip()
    try:
        if choice == "1": print(f"The sum is: {add_numbers(numbers)}")
        elif choice == "2": print(f"The result is: {subtract_numbers(numbers)}")
        elif choice == "3": print(f"The product is: {multiply_numbers(numbers)}")
        elif choice == "4": print(f"The result is: {divide_numbers(numbers)}")
        elif choice == "5": print(f"The result is: {power_numbers(numbers)}")
        elif choice == "6": print(f"The result is: {root_numbers(numbers)}")
    except ValueError as e:
        print(e)


if __name__ == "__main__":
    main()
