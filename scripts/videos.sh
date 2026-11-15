#!/usr/bin/env bash
# Encode ambient loop masters into the web set + update src/data/videos.json.
# Usage: bash scripts/videos.sh <master.mp4|mov> <id> [<master2> <id2> ...]
# Output per id (public/video/): <id>-1080.mp4 (H.264) <id>-1080.webm (VP9) <id>-720.mp4 <id>-720.webm
#                                <id>-poster.jpg <id>-poster.webp (frame 0, 1080w)
# Audio stripped; faststart; targets: 720p <= 3 MB, every file < 10 MB (GitHub Pages; NO Git LFS).
set -euo pipefail
FF=${FFMPEG:-$(command -v ffmpeg || echo /Users/jessica/.hermes/tools/ffmpeg-9.0.1-darwin-arm64/ffmpeg)}
HERE="$(cd "$(dirname "$0")/.." && pwd)"; OUT="$HERE/public/video"; MAN="$HERE/src/data/videos.json"
mkdir -p "$OUT"
while [ $# -ge 2 ]; do
  SRC="$1"; ID="$2"; shift 2
  for H in 1080 720; do
    if [ $H = 1080 ]; then MP4CRF=26; WEBMCRF=36; MAXR=3500k; else MP4CRF=28; WEBMCRF=38; MAXR=2000k; fi
    VF="scale=-2:${H}:flags=lanczos,fps=30,format=yuv420p"
    "$FF" -y -loglevel error -i "$SRC" -an -vf "$VF" -c:v libx264 -preset slow -profile:v high -crf $MP4CRF \
      -maxrate $MAXR -bufsize $((${MAXR%k}*2))k -movflags +faststart "$OUT/$ID-$H.mp4"
    "$FF" -y -loglevel error -i "$SRC" -an -vf "$VF" -c:v libvpx-vp9 -crf $WEBMCRF -b:v $MAXR -row-mt 1 -deadline good -cpu-used 2 \
      "$OUT/$ID-$H.webm"  # constrained quality: CRF capped at MAXR
  done
  "$FF" -y -loglevel error -i "$SRC" -frames:v 1 -vf "scale=1920:-2:flags=lanczos" -q:v 3 "$OUT/$ID-poster.jpg"
  "$FF" -y -loglevel error -i "$SRC" -frames:v 1 -vf "scale=1920:-2:flags=lanczos" -quality 78 "$OUT/$ID-poster.webp"
  python3 - "$MAN" "$OUT" "$ID" "$FF" <<'PY'
import json, os, re, subprocess, sys
man, out, id_, ff = sys.argv[1:]
d = json.load(open(man)) if os.path.exists(man) else {}
# probe with ffmpeg itself (no ffprobe dependency)
info = subprocess.run([ff, '-hide_banner', '-i', f'{out}/{id_}-1080.mp4'], capture_output=True, text=True).stderr
w, h = map(int, re.search(r'Video:.*?, (\d{2,5})x(\d{2,5})', info).groups())
hh, mm, ss = re.search(r'Duration: (\d+):(\d+):([\d.]+)', info).groups()
dur = int(hh) * 3600 + int(mm) * 60 + float(ss)
sizes = {h: {e: os.path.getsize(f'{out}/{id_}-{h}.{e}') for e in ('mp4', 'webm')} for h in ('720', '1080')}
d[id_] = {'w': w, 'h': h, 'dur': round(dur, 2), 'poster': f'{id_}-poster.jpg', 'sizes': sizes}
json.dump(d, open(man, 'w'), indent=2)
big = [f'{h}.{e}={v/1e6:.1f}MB' for h, x in sizes.items() for e, v in x.items() if v > 10e6 or (h == '720' and v > 3e6)]
print(id_, 'ok', sizes, ('OVER BUDGET: ' + ', '.join(big)) if big else '')
PY
done
