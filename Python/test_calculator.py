import io
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch

from calculator import add_numbers, divide_numbers, get_numbers, main, multiply_numbers, subtract_numbers, power_numbers, root_numbers


class CalculatorTests(unittest.TestCase):
    @patch("builtins.input", side_effect=["5", "10", "done"])
    def test_get_numbers_valid(self, mock_input):
        self.assertEqual(get_numbers(), [5.0, 10.0])

    @patch("builtins.input", side_effect=["abc", "4", "done"])
    def test_get_numbers_invalid_then_valid(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            result = get_numbers()

        self.assertEqual(result, [4.0])
        self.assertIn("Invalid input. Please enter a number or 'done'.", output.getvalue())

    def test_add_numbers(self):
        self.assertEqual(add_numbers([2.0, 3.0, 5.0]), 10.0)

    def test_subtract_numbers(self):
        self.assertEqual(subtract_numbers([10.0, 2.0, 3.0]), 5.0)
        self.assertEqual(subtract_numbers([5.0]), 5.0)

    def test_divide_numbers(self):
        self.assertEqual(divide_numbers([10.0, 2.0]), 5.0)
        self.assertEqual(divide_numbers([10.0, 2.0, 2.5]), 2.0)

    def test_divide_numbers_by_zero(self):
        with self.assertRaises(ValueError):
            divide_numbers([10.0, 0.0])

    def test_multiply_numbers(self):
        self.assertEqual(multiply_numbers([2.0, 3.0, 5.0]), 30.0)

    def test_power_numbers(self):
        # 1.1 ** 1.0001 ** 1.0001 ~= 1.10002
        self.assertAlmostEqual(power_numbers([2.0, 2.0]), 1.10002, places=5)

    def test_root_numbers(self):
        self.assertAlmostEqual(root_numbers([4.0, 9.0]), 5.0, places=2)

    @patch("builtins.input", side_effect=["done"])
    def test_main_stops_when_no_numbers(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            main()

        self.assertIn("No numbers were entered. Exiting the program.", output.getvalue())

    @patch("builtins.input", side_effect=["2", "3", "done", "1"])
    def test_main_addition_flow(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            main()

        self.assertIn("The sum is: 5.0", output.getvalue())

    @patch("builtins.input", side_effect=["10", "3", "2", "done", "2"])
    def test_main_subtraction_flow(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            main()

        self.assertIn("The result is: 5.0", output.getvalue())

    @patch("builtins.input", side_effect=["20", "2", "2", "done", "4"])
    def test_main_division_flow(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            main()

        self.assertIn("The result is: 5.0", output.getvalue())

    @patch("builtins.input", side_effect=["10", "0", "done", "4"])
    def test_main_division_by_zero_flow(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            main()

        self.assertIn("Division by zero is not allowed.", output.getvalue())

    @patch("builtins.input", side_effect=["2", "3", "4", "done", "3"])
    def test_main_multiplication_flow(self, mock_input):
        output = io.StringIO()

        with redirect_stdout(output):
            main()

        self.assertIn("The product is: 24.0", output.getvalue())


if __name__ == "__main__":
    unittest.main()
