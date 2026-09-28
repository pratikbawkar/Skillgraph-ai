#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
build_dir="$repo_root/build/lambda"
archive="$repo_root/build/backend.zip"

rm -rf "$build_dir"
mkdir -p "$build_dir"

python3 -m pip install \
  --platform manylinux2014_aarch64 \
  --implementation cp \
  --python-version 3.11 \
  --abi cp311 \
  --only-binary=:all: \
  --target "$build_dir" \
  -r "$repo_root/backend/requirements.txt"

cp -R "$repo_root/backend/app" "$build_dir/app"
cp "$repo_root/backend/handler.py" "$build_dir/handler.py"

rm -f "$archive"
(cd "$build_dir" && zip -qr "$archive" .)
echo "Created $archive"
