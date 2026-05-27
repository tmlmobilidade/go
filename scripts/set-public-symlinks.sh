#!/bin/bash

## Detect directories with the following structure:
## modules/{MODULE}/apps/frontend/

find modules -type d -path "*/apps/frontend" -o -path "*/apps/frontend-navegante-app" | while read -r dir; do

    public_dir="$dir/public"
    echo "Setting up symlink at $public_dir"

    # Remove existing directory or symlink
    rm -rf "$public_dir"

    # Create public as a symlink pointing to root-level assets
    ln -s "$(pwd)/assets" "$public_dir"

done