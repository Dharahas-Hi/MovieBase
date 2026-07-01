from app.services.auth_service import (
    create_access_token,
    hash_password,
    verify_access_token,
    verify_password,
)


def test_password_hashing_round_trip():
    raw_password = "secret123"
    hashed_password = hash_password(raw_password)

    assert hashed_password != raw_password
    assert verify_password(raw_password, hashed_password)
    assert not verify_password("wrong-password", hashed_password)


def test_token_round_trip():
    username = "demo-user"
    token = create_access_token(username)

    assert verify_access_token(token, username)
    assert not verify_access_token(token, "other-user")
