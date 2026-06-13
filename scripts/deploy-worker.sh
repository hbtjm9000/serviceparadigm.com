#!/bin/bash
# Wrapper to deploy with credentials from env file
set -e
cd "$(dirname "$0")/.."
source ~/.paradigm/cloudflare-credentials.env
export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID
exec npx --yes wrangler deploy 2>&1
