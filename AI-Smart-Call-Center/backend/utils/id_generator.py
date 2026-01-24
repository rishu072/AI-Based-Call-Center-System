"""
AI Smart Call Center - ID Generator Utility
Generates unique complaint IDs
"""

import random
import string
from datetime import datetime


def generate_complaint_id():
    """
    Generate a unique complaint ID
    Format: COMP-YYYYMMDDHHMMSS-XXXXXXXX
    Example: COMP-20260121083045-A1B2C3D4
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"COMP-{timestamp}-{random_suffix}"


def generate_short_id(length=6):
    """
    Generate a short random ID
    Example: X7K2P9
    """
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


def generate_reference_number():
    """
    Generate a reference number for tracking
    Format: REF-XXXX-XXXX
    """
    part1 = ''.join(random.choices(string.digits, k=4))
    part2 = ''.join(random.choices(string.digits, k=4))
    return f"REF-{part1}-{part2}"


if __name__ == "__main__":
    # Test ID generation
    print("Generated Complaint ID:", generate_complaint_id())
    print("Generated Short ID:", generate_short_id())
    print("Generated Reference:", generate_reference_number())
