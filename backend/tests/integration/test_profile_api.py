from tests.fixtures.auth_helpers import auth_headers, register_user


def test_get_profile_without_token_returns_401(client):
    response = client.get("/profile")
    assert response.status_code == 401


def test_get_profile_with_invalid_token_returns_401(client):
    response = client.get("/profile", headers=auth_headers("not-a-real-token"))
    assert response.status_code == 401


def test_get_profile_with_valid_token_returns_profile(client):
    body = register_user(client, email="profileget@example.com", display_name="Profile Getter")
    response = client.get("/profile", headers=auth_headers(body["token"]))
    assert response.status_code == 200
    profile = response.json()
    assert profile["email"] == "profileget@example.com"
    assert profile["displayName"] == "Profile Getter"


def test_update_profile_without_token_returns_401(client):
    response = client.put("/profile", json={"displayName": "New Name"})
    assert response.status_code == 401


def test_update_profile_updates_allowed_fields(client):
    body = register_user(client, email="profileupdate@example.com")
    token = body["token"]
    response = client.put(
        "/profile",
        headers=auth_headers(token),
        json={
            "displayName": "Updated Name",
            "targetRoleId": "cloud-engineer",
            "weeklyAvailabilityHours": 12,
        },
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["displayName"] == "Updated Name"
    assert updated["targetRoleId"] == "cloud-engineer"
    assert updated["weeklyAvailabilityHours"] == 12

    # Confirm the update persisted.
    refetched = client.get("/profile", headers=auth_headers(token))
    assert refetched.json()["displayName"] == "Updated Name"


def test_update_profile_partial_update_leaves_other_fields_untouched(client):
    body = register_user(client, email="partial@example.com", display_name="Original Name")
    token = body["token"]
    response = client.put(
        "/profile", headers=auth_headers(token), json={"weeklyAvailabilityHours": 3}
    )
    assert response.status_code == 200
    updated = response.json()
    assert updated["displayName"] == "Original Name"
    assert updated["weeklyAvailabilityHours"] == 3


def test_update_profile_invalid_hours_returns_422(client):
    body = register_user(client, email="badhours@example.com")
    response = client.put(
        "/profile", headers=auth_headers(body["token"]), json={"weeklyAvailabilityHours": 999}
    )
    assert response.status_code == 422
