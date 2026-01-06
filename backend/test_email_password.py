"""
Test email with password (with and without spaces)
"""
import os
import smtplib
import ssl
from dotenv import load_dotenv

load_dotenv()

smtp_host = os.getenv("SMTP_HOST")
smtp_port = int(os.getenv("SMTP_PORT", "465"))
smtp_username = os.getenv("SMTP_USERNAME")
smtp_password = os.getenv("SMTP_PASSWORD")
from_email = os.getenv("FROM_EMAIL")

print("Testing email authentication...")
print(f"Password from .env (with spaces): '{smtp_password}'")
print(f"Password length: {len(smtp_password)} characters")

# Try with spaces (as stored)
print("\n1. Testing with password AS-IS (with spaces):")
try:
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
        server.login(smtp_username, smtp_password)
        print("   [SUCCESS] Authentication worked with spaces!")
except Exception as e:
    print(f"   [FAILED] {e}")

# Try without spaces
password_no_spaces = smtp_password.replace(" ", "")
print(f"\n2. Testing with password WITHOUT spaces: '{password_no_spaces}'")
print(f"   Password length: {len(password_no_spaces)} characters")
try:
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
        server.login(smtp_username, password_no_spaces)
        print("   [SUCCESS] Authentication worked WITHOUT spaces!")
        print("\n   SOLUTION: Update your .env file to:")
        print(f"   SMTP_PASSWORD={password_no_spaces}")
except Exception as e:
    print(f"   [FAILED] {e}")

