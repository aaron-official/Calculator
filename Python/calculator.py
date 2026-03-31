"""A simple calculator CLI app."""


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


def multiply_numbers(numbers):
    """Return the product of all numbers in the list."""
    product = 1

    for number in numbers:
        product *= number

    return product


def main():
    """Run the calculator program."""
    print("Welcome to the simple calculator!")

    numbers = get_numbers()

    if not numbers:
        print("No numbers were entered. Exiting the program.")
        return

    print("\nChoose an operation:")
    print("1. Addition")
    print("2. Multiplication")

    choice = input("Enter your choice (1 or 2): ").strip()

    if choice == "1":
        total = add_numbers(numbers)
        print(f"The sum is: {total}")
    elif choice == "2":
        product = multiply_numbers(numbers)
        print(f"The product is: {product}")
    else:
        print("Invalid choice. Please run the program again and choose 1 or 2.")


if __name__ == "__main__":
    main()
