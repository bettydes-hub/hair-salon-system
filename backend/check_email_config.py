"""
Quick script to check email configuration
Run this to diagnose email setup issues
"""
import os
from dotenv import load_dotenv

# Load .env
load_dotenv()

print("=" * 50)
print("EMAIL CONFIGURATION CHECK")
print("=" * 50)

# Check environment variables
smtp_host = os.getenv("SMTP_HOST")
smtp_port = os.getenv("SMTP_PORT")
smtp_username = os.getenv("SMTP_USERNAME")
smtp_password = os.getenv("SMTP_PASSWORD")
from_email = os.getenv("FROM_EMAIL")

print("\n1. Environment Variables:")
print(f"   SMTP_HOST: {smtp_host or '[NOT SET]'}")
print(f"   SMTP_PORT: {smtp_port or '[NOT SET]'}")
print(f"   SMTP_USERNAME: {smtp_username or '[NOT SET]'}")
print(f"   SMTP_PASSWORD: {'[SET]' if smtp_password else '[NOT SET]'} ({'*' * 10 if smtp_password else 'None'})")
print(f"   FROM_EMAIL: {from_email or '[NOT SET]'}")

if not all([smtp_host, smtp_port, smtp_username, smtp_password, from_email]):
    print("\n[ERROR] Some SMTP variables are missing!")
    print("   Please add them to your .env file in the backend/ directory")
    print("\n   Required variables:")
    print("   SMTP_HOST=smtp.gmail.com")
    print("   SMTP_PORT=465")
    print("   SMTP_USERNAME=bechode2112@gmail.com")
    print("   SMTP_PASSWORD=your_16_character_app_password")
    print("   FROM_EMAIL=bechode2112@gmail.com")
    exit(1)

print("\n2. Testing SMTP Connection...")
try:
    import smtplib
    import ssl
    
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_host, int(smtp_port), context=context) as server:
        print(f"   [OK] Connected to {smtp_host}:{smtp_port}")
        server.login(smtp_username, smtp_password)
        print(f"   [OK] Login successful with {smtp_username}")
        print("\n[SUCCESS] Email configuration is correct!")
        print("\nIf emails still don't send:")
        print("   - Check spam folder")
        print("   - Verify recipient email address")
        print("   - Check backend console for error messages")
        print("   - Make sure backend was restarted after adding .env variables")
        
except smtplib.SMTPAuthenticationError as e:
    print(f"   [ERROR] Authentication failed: {e}")
    print("\n   This usually means:")
    print("   - You're using your regular Gmail password instead of an App Password")
    print("   - The App Password is incorrect")
    print("   - 2-Step Verification is not enabled on your Gmail account")
    print("\n   Solution: Create a Gmail App Password (see EMAIL_QUICK_SETUP.md)")
    
except Exception as e:
    print(f"   [ERROR] Connection failed: {e}")
    print("\n   Possible issues:")
    print("   - Firewall blocking connection to smtp.gmail.com:465")
    print("   - Internet connection problem")
    print("   - SMTP settings incorrect")

print("\n" + "=" * 50)

