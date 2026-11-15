#!/usr/bin/env bash
# Lighthouse (mobile emulation, default throttling) for a few key routes.
# Usage: bash qa/lighthouse.sh [base-url]   default: local GH-Pages-like server on :4178 serving dist/
set -euo pipefail
cd "$(dirname "$0")/.."
BASE_URL=${1:-}
if [ -z "$BASE_URL" ]; then node scripts/serve.cjs 4178 >/dev/null & SP=$!; trap 'kill $SP' EXIT; sleep 1; BASE_URL=http://localhost:4178/zeitwerk-preview/; fi
export CHROME_PATH=${CHROME_PATH:-$(node -e "console.log(require('playwright').chromium.executablePath())")}
mkdir -p qa/out
for R in ${LH_ROUTES:-home services/ai-receptionist projects/property-intelligence-platform contact}; do
  [ "$R" = home ] && R=""
  N=${R:-home}; N=${N//\//_}
  npx -y lighthouse@12 "${BASE_URL}${R}" --quiet --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo \
    --chrome-flags="--headless=new --no-sandbox" --output=json --output-path="qa/out/lh-$N.json" >/dev/null 2>&1 || true
  node -e "const r=require('./qa/out/lh-$N.json');const c=r.categories;const a=r.audits;console.log('$N'.padEnd(40),Object.entries(c).map(([k,v])=>k.slice(0,4)+'='+Math.round(v.score*100)).join(' '),'LCP='+a['largest-contentful-paint'].displayValue,'CLS='+a['cumulative-layout-shift'].displayValue,'TBT='+a['total-blocking-time'].displayValue)" || echo "$N lighthouse failed"
done
# Note: SEO category is expected < 100 on the preview because of the deliberate noindex.
