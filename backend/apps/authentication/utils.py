import jwt
import secrets
from datetime import datetime, timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from .models import User, MagicLink


def create_access_token(user: User) -> str:
    """Create a JWT access token for the user."""
    payload = {
        'user_id': user.id,
        'email': user.email,
        'exp': datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS),
        'iat': datetime.utcnow(),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")


def get_user_from_token(token: str) -> User:
    """Get user from JWT token."""
    payload = decode_access_token(token)
    user_id = payload.get('user_id')

    if not user_id:
        raise ValueError("Invalid token payload")

    try:
        user = User.objects.get(id=user_id, is_active=True)
        return user
    except User.DoesNotExist:
        raise ValueError("User not found")


def create_magic_link(user: User) -> MagicLink:
    """Create a magic link token for the user."""
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(minutes=settings.MAGIC_LINK_EXPIRY_MINUTES)

    magic_link = MagicLink.objects.create(
        user=user,
        token=token,
        expires_at=expires_at
    )

    return magic_link


def send_magic_link_email(user: User, magic_link: MagicLink, frontend_url: str):
    """Send magic link email to user."""
    login_url = f"{frontend_url}/auth/verify?token={magic_link.token}"

    subject = "Your login link"
    message = f"""
    Hello {user.email},

    Click the link below to log in to your account:

    {login_url}

    This link will expire in {settings.MAGIC_LINK_EXPIRY_MINUTES} minutes.

    If you didn't request this link, please ignore this email.
    """

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def verify_magic_link(token: str) -> User:
    """Verify a magic link token and return the user."""
    try:
        magic_link = MagicLink.objects.get(token=token)
    except MagicLink.DoesNotExist:
        raise ValueError("Invalid magic link")

    if not magic_link.is_valid():
        raise ValueError("Magic link has expired or already been used")

    magic_link.used_at = timezone.now()
    magic_link.save()

    return magic_link.user
