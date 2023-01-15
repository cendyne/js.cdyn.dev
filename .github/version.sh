#!/bin/bash

now=$(date +"%Y-%m-%dT%H:%M:%SZ")
commit="${GITHUB_SHA}"

if [ -z "$commit" ]; then
commit=$(git rev-parse HEAD)
fi

jq -n --arg date "$now" --arg commit "$commit" '{"date": $date, "commit": $commit}' > build.json
# Show what was assigned:
cat build.json | jq