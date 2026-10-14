import hashlib
import secrets

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError


# Argon2id with the library's RFC 9106 defaults (64 MiB, 3 passes).
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def password_needs_rehash(password_hash: str) -> bool:
    """True when the hash was made with older parameters than today's defaults."""
    return _hasher.check_needs_rehash(password_hash)


# Verified against when an email isn't registered, so a failed login takes
# about as long whether or not the account exists.
_DUMMY_HASH = _hasher.hash(secrets.token_urlsafe(16))


def spend_verification_time(password: str) -> None:
    verify_password(_DUMMY_HASH, password)


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    # Session tokens are long and random, so a fast hash is enough; it keeps
    # a leaked database from exposing usable cookies.
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
