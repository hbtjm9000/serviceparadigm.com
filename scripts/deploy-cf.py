#!/usr/bin/env python3
"""Deploy to Cloudflare Pages via REST API.
Replaces wrangler CLI which fails for account-owned tokens.
"""
import os, sys, json, hashlib, subprocess
from pathlib import Path

TOKEN = os.environ.get("CLOUDFLARE_API_TOKEN", "")
ACCOUNT_ID = os.environ.get("CLOUDFLARE_ACCOUNT_ID", "")
PROJECT = "serviceparadigm-com"
BRANCH = "production"
DIST_DIR = "dist"

if not TOKEN or not ACCOUNT_ID:
    print("ERROR: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set")
    sys.exit(1)

# Step 1: Build
print("=== Building ===")
r = subprocess.run(["bun", "run", "build"], capture_output=True, text=True, timeout=120)
print(r.stdout[-500:] if len(r.stdout) > 500 else r.stdout)
if r.returncode != 0:
    print("BUILD FAILED:", r.stderr[-200:])
    sys.exit(1)

# Step 2: Generate manifest
print("=== Generating manifest ===\n")
dist = Path(DIST_DIR)
funcs = Path("functions")
if not dist.exists():
    print(f"ERROR: {DIST_DIR} not found")
    sys.exit(1)

manifest = {}
files = []

# Static assets from Astro build
for f in sorted(dist.rglob("*")):
    if f.is_file():
        rel = str(f.relative_to(dist))
        sha = hashlib.sha256(f.read_bytes()).hexdigest()
        manifest[rel] = sha
        files.append(f)

# Pages Functions (API routes)
if funcs.exists():
    for f in sorted(funcs.rglob("*")):
        if f.is_file():
            abs_f = f.absolute()
            rel = str(abs_f.relative_to(Path.cwd().absolute()))
            sha = hashlib.sha256(f.read_bytes()).hexdigest()
            manifest[rel] = sha
            files.append(abs_f)

print(f"  {len(files)} files ({len([f for f in files if 'functions' in str(f)])} functions)")

# Step 3: Create deployment via multipart POST
print("=== Deploying ===")
import urllib.request

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"

def mime_part(name, value, filename=None):
    part = f"--{boundary}\r\n"
    part += f'Content-Disposition: form-data; name="{name}"'
    if filename:
        part += f'; filename="{filename}"'
        part += f'\r\nContent-Type: application/octet-stream'
    part += "\r\n\r\n"
    if isinstance(value, str):
        return part.encode() + value.encode() + b"\r\n"
    elif isinstance(value, bytes):
        return part.encode() + value + b"\r\n"
    else:
        return part.encode() + str(value).encode() + b"\r\n"

# Build body
body_parts = []
body_parts.append(mime_part("branch", BRANCH))
body_parts.append(mime_part("manifest", json.dumps(manifest)))

commit_hash = os.environ.get("GITHUB_SHA", subprocess.run(
    ["git", "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip())
commit_msg = os.environ.get("GITHUB_MESSAGE", f"Deploy {commit_hash[:8]}")

body_parts.append(mime_part("commit_hash", commit_hash))
body_parts.append(mime_part("commit_message", commit_msg))

for f in files:
    # Get the project-relative path for the form field name
    abs_f = f.absolute() if isinstance(f, Path) else Path(f).absolute()
    proj_root = Path.cwd().absolute()
    rel_path = str(abs_f.relative_to(proj_root))
    body_parts.append(mime_part(rel_path, f.read_bytes()))

body_parts.append(f"--{boundary}--\r\n".encode())
body = b"".join(body_parts)

url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/pages/projects/{PROJECT}/deployments"
req = urllib.request.Request(url, data=body, method="POST")
req.add_header("Authorization", f"Bearer {TOKEN}")
req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")

try:
    resp = urllib.request.urlopen(req, timeout=120)
    d = json.loads(resp.read())
    if d.get("success"):
        result = d.get("result", {})
        print(f"✅ Deployment created!")
        print(f"   URL: {result.get('url','?')}")
        print(f"   Environment: {result.get('environment','?')}")
        print(f"   Aliases: {result.get('aliases',[])}")
    else:
        print(f"❌ API failed: {d.get('errors',[{}])[0].get('message','?')}")
        sys.exit(1)
except urllib.error.HTTPError as e:
    print(f"❌ HTTP {e.code}")
    body = json.loads(e.read())
    for err in body.get("errors", []):
        print(f"   Error {err.get('code')}: {err.get('message')}")
    sys.exit(1)
except Exception as e:
    print(f"❌ {e}")
    sys.exit(1)
