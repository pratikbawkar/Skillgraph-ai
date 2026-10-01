"""Admin-managed recommended-video overrides, persisted in DynamoDB.

Reads are public. Writes require a Cognito access token whose user belongs to
the Cognito "admin" group (validated with Cognito GetUser +
AdminListGroupsForUser; no custom JWT handling). boto3 ships with the Lambda
Python runtime, so it is imported lazily and never needed for local mock mode.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from pydantic import BaseModel, Field, HttpUrl

from app.core.config import get_settings

ADMIN_GROUP = "admin"

router = APIRouter(prefix="/content", tags=["content"])


class VideoOverrideIn(BaseModel):
    videoTitle: str = Field(min_length=1, max_length=200)
    youtubeUrl: HttpUrl
    note: str | None = Field(default=None, max_length=500)


class VideoOverrideOut(BaseModel):
    skillId: str
    videoTitle: str
    youtubeUrl: str
    note: str | None = None
    updatedAt: str
    updatedBy: str


def get_videos_table() -> Any:
    table_name = get_settings().admin_videos_table_name
    if not table_name:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin video storage is not configured",
        )
    import boto3

    return boto3.resource("dynamodb").Table(table_name)


def get_cognito_client() -> Any:
    import boto3

    return boto3.client("cognito-idp")


def require_admin_username(
    cognito: Annotated[Any, Depends(get_cognito_client)],
    authorization: Annotated[str | None, Header()] = None,
) -> str:
    """Return the Cognito username of a valid admin, else raise 401/403."""
    parts = (authorization or "").split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer" or not parts[1]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer access token"
        )
    try:
        username = cognito.get_user(AccessToken=parts[1])["Username"]
    except Exception:  # invalid/expired token or Cognito error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token"
        ) from None

    pool_id = get_settings().cognito_user_pool_id
    try:
        groups = cognito.admin_list_groups_for_user(UserPoolId=pool_id, Username=username)["Groups"]
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unable to verify admin access"
        ) from None
    if not any(group.get("GroupName") == ADMIN_GROUP for group in groups):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return username


@router.get("/skills/{skill_id}/video", response_model=VideoOverrideOut)
def get_video_override(skill_id: str, table: Annotated[Any, Depends(get_videos_table)]) -> dict:
    item = table.get_item(Key={"skillId": skill_id}).get("Item")
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No video override")
    return item


@router.put("/skills/{skill_id}/video", response_model=VideoOverrideOut)
def put_video_override(
    skill_id: str,
    body: VideoOverrideIn,
    username: Annotated[str, Depends(require_admin_username)],
    table: Annotated[Any, Depends(get_videos_table)],
) -> dict:
    item = {
        "skillId": skill_id,
        "videoTitle": body.videoTitle,
        "youtubeUrl": str(body.youtubeUrl),
        "note": body.note or "",
        "updatedAt": datetime.now(UTC).isoformat(),
        "updatedBy": username,
    }
    table.put_item(Item=item)
    return item


@router.delete("/skills/{skill_id}/video", status_code=status.HTTP_204_NO_CONTENT)
def delete_video_override(
    skill_id: str,
    _username: Annotated[str, Depends(require_admin_username)],
    table: Annotated[Any, Depends(get_videos_table)],
) -> Response:
    table.delete_item(Key={"skillId": skill_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)
