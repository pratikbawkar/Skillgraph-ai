from tests.fixtures.auth_helpers import DEFAULT_PASSWORD, register_user


def test_register_valid_request_returns_token_and_user(client):
    body = register_user(client, email="new@example.com", display_name="New User")
    assert body["token"]
    assert body["user"]["email"] == "new@example.com"
    assert body["user"]["displayName"] == "New User"
    assert body["user"]["targetRoleId"] is None
    assert body["user"]["weeklyAvailabilityHours"] == 5
    assert "id" in body["user"]


def test_register_missing_fields_returns_422(client):
    response = client.post("/auth/register", json={"email": "missing@example.com"})
    assert response.status_code == 422


def test_register_invalid_email_returns_422(client):
    response = client.post(
        "/auth/register",
        json={"email": "not-an-email", "password": DEFAULT_PASSWORD, "displayName": "X"},
    )
    assert response.status_code == 422


def test_register_short_password_returns_422(client):
    response = client.post(
        "/auth/register",
        json={"email": "short@example.com", "password": "short", "displayName": "X"},
    )
    assert response.status_code == 422


def test_register_duplicate_email_returns_409(client):
    register_user(client, email="dupe@example.com")
    response = client.post(
        "/auth/register",
        json={
            "email": "dupe@example.com",
            "password": DEFAULT_PASSWORD,
            "displayName": "Someone Else",
        },
    )
    assert response.status_code == 409


def test_login_valid_credentials_returns_token(client):
    register_user(client, email="login@example.com")
    response = client.post(
        "/auth/login", json={"email": "login@example.com", "password": DEFAULT_PASSWORD}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["token"]
    assert body["user"]["email"] == "login@example.com"


def test_login_wrong_password_returns_401(client):
    register_user(client, email="wrongpw@example.com")
    response = client.post(
        "/auth/login", json={"email": "wrongpw@example.com", "password": "totally-wrong-pw"}
    )
    assert response.status_code == 401


def test_login_unknown_email_returns_401(client):
    response = client.post(
        "/auth/login", json={"email": "nobody@example.com", "password": DEFAULT_PASSWORD}
    )
    assert response.status_code == 401


def test_login_missing_fields_returns_422(client):
    response = client.post("/auth/login", json={"email": "missing@example.com"})
    assert response.status_code == 422
