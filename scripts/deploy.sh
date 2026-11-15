#!/usr/bin/env bash
# Build + deploy to GitHub Pages: https://itrapidsupport.github.io/zeitwerk-preview/
#   main     = app source (this folder, minus node_modules/dist)
#   gh-pages = built dist/ (Pages source). Plain files only: GitHub Pages does NOT serve Git LFS objects.
# Token: $GH_TOKEN or ~/.hermes/cache/scratch/.zw08tok (repo scope). PREVIEW ONLY — never point this at NaukhanGreenwin/Zeitwerk.
set -euo pipefail
APP="$(cd "$(dirname "$0")/.." && pwd)"
REPO=Itrapidsupport/zeitwerk-preview
case "$REPO" in *NaukhanGreenwin/Zeitwerk*) echo "refusing: live repo"; exit 1;; esac
TOKEN=${GH_TOKEN:-$(cat ~/.hermes/cache/scratch/.zw08tok)}
URL="https://x-access-token:${TOKEN}@github.com/${REPO}.git"
WORK=${DEPLOY_DIR:-$HOME/.hermes/cache/scratch/zeitwerk-preview-deploy}
MSG=${1:-"preview build $(date '+%Y-%m-%d %H:%M %Z')"}

cd "$APP"
[ "${SKIP_BUILD:-}" = 1 ] || npm run build
grep -q 'noindex' dist/index.html || { echo "noindex missing"; exit 1; }
BIG=$(find dist -type f -size +10M); [ -z "$BIG" ] || { echo "files >10MB (Pages/git limit): $BIG"; exit 1; }

git_id() { git -c user.name="IT Rapid Support previews" -c user.email="itrapidsupport-previews@users.noreply.github.com" "$@"; }

# --- source -> main
SRC="$WORK/src"; rm -rf "$SRC"; mkdir -p "$SRC"
rsync -a --exclude node_modules --exclude dist --exclude qa/out --exclude .git "$APP/" "$SRC/"
cd "$SRC"; git init -q -b main; git add -A; git_id commit -qm "$MSG"; git push -q -f "$URL" main

# --- dist -> gh-pages
PAGES="$WORK/pages"; rm -rf "$PAGES"; mkdir -p "$PAGES"
rsync -a "$APP/dist/" "$PAGES/"
cd "$PAGES"; git init -q -b gh-pages; git add -A; git_id commit -qm "$MSG"; git push -q -f "$URL" gh-pages
echo "pushed main + gh-pages to $REPO"
