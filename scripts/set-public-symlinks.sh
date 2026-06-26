#!/bin/bash

## Detect directories with the following structure:
## modules/{MODULE}/apps/frontend/
## modules/{MODULE}/apps/frontend-navegante-app/
## modules/{MODULE}/apps/frontend-homepage/

find modules -type d \( -path "*/apps/frontend" -o -path "*/apps/frontend-navegante-app" -o -path "*/apps/frontend-homepage" \) | while read -r dir; do

    public_dir="$dir/public"
    assets_link="$public_dir/assets"
    echo "Setting up symlink at $assets_link"

    mkdir -p "$public_dir"

    # Remove only the assets symlink/directory, preserving other public files (e.g. media/)
    rm -rf "$assets_link"

    # Create assets as a symlink pointing to root-level assets
    ln -s "$(pwd)/assets" "$assets_link"

done