#!/bin/bash

apps=(alerts controller auth plans)

# Check if --target parameter is provided
if [ "$1" == "--target" ] && [ -n "$2" ]; then
  TARGET="$2"
else
  TARGET=""
fi

# For each App folder in apps run NCU in parallel
for app in "${apps[@]}"; do
  (
    echo "🔄 Updating packages in $app..."
    cd "$app" || { echo "❌ Directory $app not found."; exit 1; }

    # Run ncu and update package.json
    if [ -n "$TARGET" ]; then
      ncu -u --workspaces --target "$TARGET"
    else
      ncu -u --workspaces
    fi
    npm install

    echo "✅ Finished updating $app"
  ) &
done

# Wait for all background jobs to complete
wait

echo "🎉 All updates completed!"