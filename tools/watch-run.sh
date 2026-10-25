#!/usr/bin/env bash
# Prints one line whenever the running/failed step of a GitHub Actions run changes; exits when the run completes.
# Usage: tools/watch-run.sh RUN_ID
RUN="$1"; REPO=woodlandarchitectsin-oss/ameencad; prev=""
while true; do
  s=$(GH_TOKEN= gh run view "$RUN" -R "$REPO" --json status,conclusion,jobs \
      --jq '.status+" "+(.conclusion//"")+" | "+([.jobs[].steps[]|select(.status!="queued" and .status!="pending")|.name+":"+(.conclusion//.status)]|join(", "))' 2>/dev/null || echo "poll-error")
  cur=$(echo "$s" | grep -oE "[^,|]+:(failure|in_progress)" | tail -1)
  st=$(echo "$s" | cut -d' ' -f1)
  if [ "$cur" != "$prev" ]; then echo "$st | $cur"; prev="$cur"; fi
  [ "$st" = "completed" ] && { echo "DONE: $s"; break; }
  sleep 60
done
