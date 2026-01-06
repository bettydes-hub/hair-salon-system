"""
Email utilities for sending verification and password reset codes.
Uses SMTP settings from environment variables.
"""
import os
import smtplib
import ssl
from email.message import EmailMessage
from typing import Optional


SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
# Remove spaces from App Password (Gmail App Passwords should be used without spaces)
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").replace(" ", "") if os.getenv("SMTP_PASSWORD") else ""
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)


def _build_message(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email
    if text_body:
        msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")
    return msg


def send_email(to_email: str, subject: str, html_body: str, text_body: Optional[str] = None) -> None:
    """
    Send an email using SMTP (designed to work with Gmail).
    Raises exceptions if SMTP is not configured or sending fails.
    """
    if not (SMTP_HOST and SMTP_PORT and SMTP_USERNAME and SMTP_PASSWORD and FROM_EMAIL):
        raise RuntimeError("SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, FROM_EMAIL")

    msg = _build_message(to_email, subject, html_body, text_body)

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, context=context) as server:
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)


def build_verification_email(name: str, code: str) -> dict:
    subject = "Your verification code"
    text_body = f"Hello {name},\n\nYour verification code is: {code}\nThis code will expire in 15 minutes.\n\nThanks,\nHair Salon Team"
    html_body = f"""
    <p>Hello {name},</p>
    <p>Your verification code is:</p>
    <h2 style="letter-spacing:3px;">{code}</h2>
    <p>This code will expire in 15 minutes.</p>
    <p>Thanks,<br/>Hair Salon Team</p>
    """
    return {"subject": subject, "html_body": html_body, "text_body": text_body}


def build_password_reset_email(name: str, code: str) -> dict:
    subject = "Password reset code"
    text_body = f"Hello {name},\n\nUse this code to reset your password: {code}\nThis code will expire in 15 minutes.\n\nIf you didn't request this, you can ignore this email.\n\nThanks,\nHair Salon Team"
    html_body = f"""
    <p>Hello {name},</p>
    <p>Use this code to reset your password:</p>
    <h2 style="letter-spacing:3px;">{code}</h2>
    <p>This code will expire in 15 minutes.</p>
    <p>If you didn't request this, you can ignore this email.</p>
    <p>Thanks,<br/>Hair Salon Team</p>
    """
    return {"subject": subject, "html_body": html_body, "text_body": text_body}

