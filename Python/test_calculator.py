from calculator import get_numbers
from unittest.mock import patch
import pytest

@patch('builtins.input', side_effect=['5', '10', 'done'])
def test_get_numbers_valid(mock_input):
    """Test getting valid numbers from user."""
    result = get_numbers()
    assert result == [5.0, 10.0], f"Expected [5.0, 10.0], got {result}"