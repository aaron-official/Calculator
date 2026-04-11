"""A simple calculator CLI app."""

import sys
import time


def get_numbers():
    """Collect numbers from the user until they type 'done'."""
    numbers = []

    while True:
        user_input = input("Enter a number (or 'done' to finish): ").strip()

        if user_input.lower() == "done":
            break

        try:
            number = float(user_input)
            numbers.append(number)
        except ValueError:
            print("Invalid input. Please enter a number or 'done'.")

    return numbers


def add_numbers(numbers):
    """Return the total of all numbers in the list."""
    total = 0

    for number in numbers:
        total += number

    return total


def subtract_numbers(numbers):
    """Return the result of subtracting the rest of the numbers from the first one."""
    if not numbers:
        return 0

    result = numbers[0]
    for number in numbers[1:]:
        result -= number

    return result


def divide_numbers(numbers):
    """Return the result of dividing the first number by the rest of the numbers."""
    if not numbers:
        return 0

    result = numbers[0]
    for number in numbers[1:]:
        if number == 0:
            raise ValueError("Division by zero is not allowed.")
        result /= number

    return result


def multiply_numbers(numbers):
    """Return the product of all numbers in the list."""
    product = 1

    for number in numbers:
        product *= number

    return product


def main():
    """Run the calculator program."""
    if len(sys.argv) > 1 and sys.argv[1] == "--batch":
        # Format: --batch <operation_id> <count> <batch_count>
        # operation_id: 1=Add, 2=Sub, 3=Mul, 4=Div
        try:
            op = sys.argv[2]
            count = int(sys.argv[3])
            batches = int(sys.argv[4])
        except (IndexError, ValueError):
            print("Invalid batch arguments")
            return

        for i in range(batches):
            # Simulate heavy work by doing the operation multiple times
            # or just processing a chunk of numbers
            numbers = [1.1] * (count // batches)

            if op == "1":
                add_numbers(numbers)
            elif op == "2":
                subtract_numbers(numbers)
            elif op == "3":
                multiply_numbers(numbers)
            elif op == "4":
                try:
                    divide_numbers(numbers)
                except ValueError:
                    pass

            # Artificial delay to make the race visible (e.g., ~40s total)
            # We want roughly 40s total.
            # If batches = 100, then 0.4s sleep = 40s.
            time.sleep(0.4)
            print(f"PROGRESS:{((i + 1) / batches) * 100:.2f}")
            sys.stdout.flush()

        print("RESULT:SUCCESS")
        return

    print("Welcome to the simple calculator!")

    numbers = get_numbers()

    if not numbers:
        print("No numbers were entered. Exiting the program.")
        return

    print("\nChoose an operation:")
    print("1. Addition")
    print("2. Subtraction")
    print("3. Multiplication")
    print("4. Division")

    choice = input("Enter your choice (1, 2, 3, or 4): ").strip()

    if choice == "1":
        total = add_numbers(numbers)
        print(f"The sum is: {total}")
    elif choice == "2":
        result = subtract_numbers(numbers)
        print(f"The result is: {result}")
    elif choice == "3":
        product = multiply_numbers(numbers)
        print(f"The product is: {product}")
    elif choice == "4":
        try:
            result = divide_numbers(numbers)
            print(f"The result is: {result}")
        except ValueError as e:
            print(e)
    else:
        print("Invalid choice. Please run the program again and choose 1, 2, 3, or 4.")


if __name__ == "__main__":
    main()
