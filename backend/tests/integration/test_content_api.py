from __future__ import annotations

import pytest

from app.api.content import get_cognito_client, get_videos_table
from app.core.config import get_settings
from app.main import app

PAYLOAD = {
    "videoTitle": "Great AWS intro",
    "youtubeUrl": "https://www.youtube.com/watch?v=abc123",
    "note": "Start here",
}
URL = "/content/skills/aws/video"
HEADERS = {"Authorization": "Bearer access-token"}


class FakeTable:
    def __init__(self) -> None:
        self.items: dict[str, dict] = {}

    def get_item(self, Key):  # noqa: N803
        item = self.items.get(Key["skillId"])
        return {"Item": item} if item else {}

    def put_item(self, Item):  # noqa: N803
        self.items[Item["skillId"]] = Item

    def delete_item(self, Key):  # noqa: N803
        self.items.pop(Key["skillId"], None)


class FakeCognito:
    def __init__(self, groups: list[str], valid: bool = True) -> None:
        self.groups = groups
        self.valid = valid

    def get_user(self, AccessToken):  # noqa: N803
        if not self.valid:
            raise RuntimeError("NotAuthorizedException")
        return {"Username": "admin-user"}

    def admin_list_groups_for_user(self, UserPoolId, Username):  # noqa: N803
        return {"Groups": [{"GroupName": g} for g in self.groups]}


@pytest.fixture
def table():
    fake = FakeTable()
    app.dependency_overrides[get_videos_table] = lambda: fake
    yield fake
    app.dependency_overrides.clear()


def use_cognito(cognito: FakeCognito) -> None:
    app.dependency_overrides[get_cognito_client] = lambda: cognito


def test_get_returns_404_without_override(client, table):
    assert client.get(URL).status_code == 404


def test_get_returns_persisted_override(client, table):
    table.items["aws"] = {
        "skillId": "aws",
        **PAYLOAD,
        "updatedAt": "2026-01-01T00:00:00+00:00",
        "updatedBy": "admin-user",
    }
    response = client.get(URL)
    assert response.status_code == 200
    assert response.json()["videoTitle"] == "Great AWS intro"


def test_put_requires_authentication(client, table):
    use_cognito(FakeCognito(["admin"]))
    assert client.put(URL, json=PAYLOAD).status_code == 401
    assert table.items == {}


def test_put_rejects_invalid_token(client, table):
    use_cognito(FakeCognito(["admin"], valid=False))
    assert client.put(URL, json=PAYLOAD, headers=HEADERS).status_code == 401


def test_put_rejects_non_admin(client, table):
    use_cognito(FakeCognito(["students"]))
    assert client.put(URL, json=PAYLOAD, headers=HEADERS).status_code == 403
    assert table.items == {}


def test_put_accepts_admin_and_persists(client, table):
    use_cognito(FakeCognito(["admin"]))
    response = client.put(URL, json=PAYLOAD, headers=HEADERS)
    assert response.status_code == 200
    saved = table.items["aws"]
    assert saved["videoTitle"] == PAYLOAD["videoTitle"]
    assert saved["youtubeUrl"] == PAYLOAD["youtubeUrl"]
    assert saved["note"] == PAYLOAD["note"]
    assert saved["updatedBy"] == "admin-user"
    assert saved["updatedAt"]
    assert client.get(URL).json()["videoTitle"] == PAYLOAD["videoTitle"]


def test_put_rejects_invalid_url(client, table):
    use_cognito(FakeCognito(["admin"]))
    bad = {**PAYLOAD, "youtubeUrl": "not-a-url"}
    assert client.put(URL, json=bad, headers=HEADERS).status_code == 422


def test_delete_requires_admin_and_removes_override(client, table):
    table.items["aws"] = {"skillId": "aws"}
    use_cognito(FakeCognito(["students"]))
    assert client.delete(URL, headers=HEADERS).status_code == 403
    assert "aws" in table.items
    use_cognito(FakeCognito(["admin"]))
    assert client.delete(URL, headers=HEADERS).status_code == 204
    assert "aws" not in table.items


def test_storage_unconfigured_returns_503(client, monkeypatch):
    monkeypatch.setattr(get_settings(), "admin_videos_table_name", "")
    assert client.get(URL).status_code == 503
