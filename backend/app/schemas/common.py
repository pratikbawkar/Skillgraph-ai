"""Shared Pydantic base model that serializes/deserializes using camelCase
field names so JSON payloads match frontend/lib/types.ts exactly, while
Python code stays snake_case internally.
"""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
