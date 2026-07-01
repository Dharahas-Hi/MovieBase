import base64
import hashlib
import hmac
import json
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from app.config.security import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"pbkdf2_sha256$100000${_base64url_encode(salt)}${_base64url_encode(derived_key)}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        _, algorithm, salt_b64, derived_b64 = hashed_password.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = _base64url_decode(salt_b64)
        expected = _base64url_decode(derived_b64)
        derived_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
        return hmac.compare_digest(derived_key, expected)
    except ValueError:
        return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": int(now.timestamp()),
        "exp": int((now + expires_delta).timestamp()),
    }

    header = {"alg": ALGORITHM, "typ": "JWT"}
    encoded_header = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    encoded_signature = _base64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def verify_access_token(token: str, expected_subject: Optional[str] = None) -> bool:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_signature = _base64url_encode(
            hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
        )
        if not hmac.compare_digest(signature_b64, expected_signature):
            return False

        payload = json.loads(_base64url_decode(payload_b64).decode("utf-8"))
        if payload.get("exp", 0) < int(time.time()):
            return False

        if expected_subject is not None and payload.get("sub") != expected_subject:
            return False

        return True
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        return False


def decode_access_token(token: str) -> Optional[dict]:
    try:
        _, payload_b64, signature_b64 = token.split(".")
        if not verify_access_token(token):
            return None

        payload = json.loads(_base64url_decode(payload_b64).decode("utf-8"))
        return payload
    except (ValueError, json.JSONDecodeError, UnicodeDecodeError):
        return None
