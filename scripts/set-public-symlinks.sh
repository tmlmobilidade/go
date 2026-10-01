#!/bin/bash

## Detect directories with the following structure:
## modules/{MODULE}/apps/frontend/ or modules/{MODULE}/apps/frontend-navegante-app/

find modules -type d -path "*/apps/frontend" -o -path "*/apps/frontend-navegante-app" | while read -r dir; do

    public_dir="$dir/public"
    echo "Setting up symlink at $public_dir"

    # Remove existing directory or symlink
    rm -rf "$public_dir"

	mkdir -p "$public_dir"

    # Create public as a symlink pointing to root-level assets
    ln -s "$(pwd)/assets" "$public_dir/assets"

done