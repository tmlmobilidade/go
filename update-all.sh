#!/bin/bash

apps=(alerts controller auth plans)

# For each App folder in apps run NCU in parallel
for app in "${apps[@]}"; do
  (
    echo "🔄 Updating packages in $app..."
    cd "$app" || { echo "❌ Directory $app not found."; exit 1; }

    # Run ncu and update package.json
    ncu -u --workspaces --target @latest
    npm install

    echo "✅ Finished updating $app"
  ) &
done

# Wait for all background jobs to complete
wait

echo "🎉 All updates completed!"