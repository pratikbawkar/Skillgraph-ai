#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="${PYTHON_BIN:-python3}"

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
build_dir="$repo_root/build/lambda"
archive="$repo_root/build/backend.zip"

rm -rf "$build_dir"
mkdir -p "$build_dir"

"$PYTHON_BIN" -m pip install \
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
"$PYTHON_BIN" -c 'import os, zipfile, sys; build_dir=sys.argv[1]; archive=sys.argv[2]; os.makedirs(os.path.dirname(archive), exist_ok=True); z=zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED); [z.write(os.path.join(root, f), os.path.relpath(os.path.join(root, f), build_dir)) for root, _, files in os.walk(build_dir) for f in files]; z.close()' "$build_dir" "$archive"
echo "Created $archive"
