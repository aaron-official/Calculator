'''
A Simple Calculator CLI App
'''


def get_numbers():
    numbers = []
    while True:
        user_input = input("Enter a number (or 'done' to finish): ").strip()
        if user_input.lower() == 'done':
            break
        try:
            num = float(user_input)
            numbers.append(num)
        except ValueError:
            print("Invalid input. Please enter a number or 'done'.")
    return numbers


def main():
    print("Hello from calculator!")


if __name__ == "__main__":
    main()
