#!/bin/bash

# Script to generate routes.ts file based on module structure
# Usage: ./generate-routes.sh [output_file]

set -e

# Check bash version for associative array support
if [ "${BASH_VERSION%%.*}" -lt 4 ]; then
    echo "Warning: Bash version < 4 detected. Some features may not work correctly."
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go up one level from scripts/ to the project root
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MODULES_DIR="${PROJECT_ROOT}/modules"
OUTPUT_FILE="${1:-${PROJECT_ROOT}/packages/consts/src/app-routes.ts}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Temporary file for routes
TEMP_FILE=$(mktemp)
trap "rm -f ${TEMP_FILE}" EXIT

printf "${GREEN}Generating routes.ts from module structure...${NC}\n"

# Function to convert kebab-case to SCREAMING_SNAKE_CASE
to_snake_case() {
    echo "$1" | sed 's/-/_/g' | tr '[:lower:]' '[:upper:]'
}

# Function to convert kebab-case to PascalCase
to_pascal_case() {
    echo "$1" | sed -E 's/(^|-)([a-z])/\U\2/g' | sed 's/^./\U&/'
}

# Function to sanitize route names (remove invalid characters)
sanitize_route_name() {
    echo "$1" | sed -E 's|\([^)]+\)||g' | sed 's|\.|_|g' | sed 's|/|_|g' | sed 's|-|_|g' | sed 's|__|_|g' | sed 's|^_||' | sed 's|_$||'
}

# Function to scan frontend routes
scan_frontend_routes() {
    local module_name="$1"
    local app_dir="$2"
    local routes=()

    if [ ! -d "${app_dir}/src/app" ]; then
        return
    fi

    # Find all page.tsx files and process them
    local find_temp=$(mktemp)
    find "${app_dir}/src/app" -name "page.tsx" -type f > "$find_temp"

    while IFS= read -r page_file; do
        local rel_path="${page_file#${app_dir}/src/app/}"
        local dir_path=$(dirname "$rel_path")

        # Skip root page.tsx
        if [ "$dir_path" = "." ]; then
            continue
        fi

        # Remove route groups like (authenticated) - handle them anywhere in the path
        dir_path=$(echo "$dir_path" | sed -E 's|\([^)]+\)/||g' | sed -E 's|/\([^)]+\)||g' | sed -E 's|^\([^)]+\)$||' | sed 's|^/||')

        # Check if path contains any dynamic parameters (e.g., [id], [routeId], etc.)
        if [[ "$dir_path" =~ \[([a-zA-Z][a-zA-Z0-9]*)\] ]]; then
            # Extract all dynamic parameters and their positions
            local temp_path="$dir_path"
            local base_path=""
            local route_params=""
            local param_names=()
            local path_segments=()

            # Split path by dynamic parameters and reconstruct
            while [[ "$temp_path" =~ ^([^\[]*)\[([a-zA-Z][a-zA-Z0-9]*)\](.*)$ ]]; do
                local before="${BASH_REMATCH[1]}"
                local param="${BASH_REMATCH[2]}"
                local after="${BASH_REMATCH[3]}"

                # Clean up 'before' part: remove leading/trailing slashes
                before=$(echo "$before" | sed 's|^/||' | sed 's|/$||')

                # Add the part before the parameter to path_segments if not empty
                if [ -n "$before" ]; then
                    path_segments+=("$before")
                fi

                # Store parameter name
                param_names+=("$param")

                # Continue with the rest
                temp_path="$after"
            done

            # Add any remaining path after last parameter
            temp_path=$(echo "$temp_path" | sed 's|^/||' | sed 's|/$||')
            if [ -n "$temp_path" ]; then
                path_segments+=("$temp_path")
            fi

            # Build base_path from segments
            if [ ${#path_segments[@]} -gt 0 ]; then
                base_path=$(IFS=/; echo "${path_segments[*]}")
            fi

            # Remove any remaining route groups from base_path
            base_path=$(echo "$base_path" | sed -E 's|\([^)]+\)/||g' | sed -E 's|/\([^)]+\)||g' | sed -E 's|^\([^)]+\)$||')
            # Remove module name prefix if it exists (e.g., "alerts/alerts" -> "alerts", or "alerts" -> "")
            base_path=$(echo "$base_path" | sed "s|^${module_name}/||")
            # If base_path equals module_name, remove it entirely
            if [ "$base_path" = "$module_name" ]; then
                base_path=""
            fi

            # Build route_params from param_names
            for param in "${param_names[@]}"; do
                if [ -z "$route_params" ]; then
                    route_params="\${${param}}"
                else
                    route_params="${route_params}/\${${param}}"
                fi
            done

            # Generate route name based on base_path and parameter names
            # For nested routes (multiple params), use the last param name to create unique route name
            if [ ${#param_names[@]} -gt 1 ]; then
                # Multiple params - use the last parameter name to differentiate
                # e.g., lines/[id]/[routeId] -> use "routeId" to make ROUTES_DETAIL
                local last_param="${param_names[${#param_names[@]}-1]}"
                # Convert camelCase param to separate words (e.g., routeId -> route)
                # Extract the main noun from the parameter (before 'Id' if present)
                local param_noun=$(echo "$last_param" | sed 's/Id$//' | sed 's/\([A-Z]\)/_\1/g' | sed 's/^_//')
                local route_name=$(to_snake_case "${param_noun}_DETAIL")
            elif [ -z "$base_path" ]; then
                local route_name=$(to_snake_case "${module_name}_DETAIL")
            else
                local route_name=$(to_snake_case "${base_path}_DETAIL")
            fi
            route_name=$(sanitize_route_name "$route_name")
            # Build route path with all parameters
            if [ -z "$base_path" ]; then
                local route_path="/${route_params}"
            else
                local route_path="/${base_path}/${route_params}"
            fi
            routes+=("${route_name}:${route_path}")
        else
            # It's a list route
            # Remove any remaining route groups from dir_path
            dir_path=$(echo "$dir_path" | sed -E 's|\([^)]+\)/||g' | sed -E 's|/\([^)]+\)||g' | sed -E 's|^\([^)]+\)$||')
            # Remove module name prefix if it exists (e.g., "alerts/alerts" -> "alerts", or "alerts" -> "")
            dir_path=$(echo "$dir_path" | sed "s|^${module_name}/||")
            # If dir_path equals module_name, remove it entirely
            if [ "$dir_path" = "$module_name" ]; then
                dir_path=""
            fi
            # Generate route name: use module_name if dir_path is empty, otherwise use dir_path
            if [ -z "$dir_path" ]; then
                local route_name=$(to_snake_case "${module_name}_LIST")
            else
                local route_name=$(to_snake_case "${dir_path}_LIST")
            fi
            route_name=$(sanitize_route_name "$route_name")
            # Build route path: always remove module prefix for PAGE routes
            if [ -z "$dir_path" ]; then
                local route_path="/"
            else
                local route_path="/${dir_path}"
            fi
            routes+=("${route_name}:${route_path}")
        fi
    done < "$find_temp"

    rm -f "$find_temp"

    # Output unique routes
    printf '%s\n' "${routes[@]}" | sort -u
}

# Function to extract API routes from routes.ts files
scan_api_routes() {
    local module_name="$1"
    local endpoints_dir="$2"
    local routes=()

    if [ ! -d "$endpoints_dir" ]; then
        return
    fi

    # Find all *.routes.ts files
    local find_routes_temp=$(mktemp)
    find "$endpoints_dir" -name "*.routes.ts" -type f > "$find_routes_temp"

    while IFS= read -r routes_file; do
        local namespace=""
        local endpoint_name=$(basename "$(dirname "$routes_file")")
        # Extract file name without extension (e.g., "alerts.routes.ts" -> "alerts")
        local file_name=$(basename "$routes_file" | sed 's|\.routes\.ts$||')

        # Extract namespace from the routes file (handle both const namespace and const NAMESPACE)
        namespace=$(grep -E "^\s*(const\s+)?(namespace|NAMESPACE)\s*=\s*['\"](.*)['\"]" "$routes_file" | head -1 | sed -E "s/.*['\"](.*)['\"].*/\1/" | sed 's|^/||')

        if [ -z "$namespace" ]; then
            # Fallback to endpoint name
            namespace="$endpoint_name"
        fi

        # Extract routes from instance.get/post/put/delete calls
        # Look for patterns like: instance.get('/', ...) or instance.get('/:id', ...)
        # Handle multi-line patterns where path is on next line
        local grep_temp=$(mktemp)
        # Read file and extract paths from instance method calls
        # When we find instance.get/post/put/delete, look for path in same or next line
        {
            local in_instance_call=false
            while IFS= read -r line || [ -n "$line" ]; do
                # Check if this line contains instance method call
                if echo "$line" | grep -qE "instance\.(get|post|put|delete)\s*\("; then
                    # Try to extract path from this line first
                    local path=$(echo "$line" | grep -oE "['\"]([^'\"]+)['\"]" | head -1 | sed "s|['\"]||g")
                    if [ -z "$path" ]; then
                        # Path not on same line, mark that we're in an instance call
                        in_instance_call=true
                    else
                        echo "$path"
                        in_instance_call=false
                    fi
                elif [ "$in_instance_call" = true ]; then
                    # Previous line was instance call, try to extract path from this line
                    local path=$(echo "$line" | grep -oE "['\"]([^'\"]+)['\"]" | head -1 | sed "s|['\"]||g")
                    if [ -n "$path" ]; then
                        echo "$path"
                        in_instance_call=false
                    fi
                fi
            done < "$routes_file"
        } | grep -v "^\s*$" > "$grep_temp"

        while IFS= read -r path; do
            if [ -z "$path" ]; then
                continue
            fi

            # Use namespace for route path instead of endpoint_name
            # Convert all variables (anything starting with :) in namespace to ${variable} format
            local namespace_for_path=$(echo "$namespace" | sed -E 's|:([a-zA-Z][a-zA-Z0-9]*)|\${\1}|g')

            # Build the full route path by combining namespace and path
            # Remove leading slash from path if it exists
            local clean_path=$(echo "$path" | sed 's|^/||')

            # Check if path contains any variable (anything starting with :)
            local is_detail_route=false
            if echo "$clean_path" | grep -qE '^:[a-zA-Z][a-zA-Z0-9]*'; then
                is_detail_route=true
            fi

            # Convert all variables (anything starting with :) in path to ${variable} format
            local clean_path_for_route=$(echo "$clean_path" | sed -E 's|:([a-zA-Z][a-zA-Z0-9]*)|\${\1}|g')

            # Extract all variables from combined namespace and path for later use
            local combined_path="${namespace}/${clean_path}"
            local route_variables=$(echo "$combined_path" | grep -oE ':[a-zA-Z][a-zA-Z0-9]*' | sort -u | tr '\n' ' ' | sed 's/ $//')

            # Combine namespace and path (namespace already has leading slash removed by extraction)
            if [ "$path" = "/" ] || [ -z "$clean_path" ]; then
                # Root path - just use the namespace (add leading slash)
                local full_route_path="/${namespace_for_path}"
            elif [[ "$clean_path_for_route" == .* ]]; then
                # Dot-suffix path (e.g. ".rss") should be concatenated without an extra slash
                local full_route_path="/${namespace_for_path}${clean_path_for_route}"
            else
                # Append the path to the namespace (add leading slash to namespace)
                local full_route_path="/${namespace_for_path}/${clean_path_for_route}"
            fi

            # Add /api prefix and module name
            local route_path="/${module_name}/api${full_route_path}"

            # Generate route name from namespace and path
            # Extract the last meaningful part from namespace for naming
            local namespace_parts=$(echo "$namespace" | sed 's|^/||' | tr '/' ' ')
            local last_namespace_part=""
            for part in $namespace_parts; do
                # Skip variable parts (anything starting with :)
                if [[ ! "$part" =~ ^: ]]; then
                    last_namespace_part="$part"
                fi
            done

            # If no meaningful part found, use endpoint_name as fallback
            if [ -z "$last_namespace_part" ]; then
                last_namespace_part="$endpoint_name"
            fi

            # Build route name
            if [ "$path" = "/" ] || [ -z "$clean_path" ]; then
                # Root path - check if namespace contains any variable to determine if it's a detail route
                if echo "$namespace" | grep -qE ':[a-zA-Z][a-zA-Z0-9]*'; then
                    local route_name=$(to_snake_case "${last_namespace_part}_DETAIL")
                else
                    local route_name=$(to_snake_case "${last_namespace_part}_LIST")
                fi
            elif [ "$is_detail_route" = true ]; then
                # Path starts with a variable - this is a detail route
                # Extract suffix after first variable if any (e.g., /:metricName -> empty, /:id/image -> image)
                local suffix_after_var=$(echo "$clean_path" | sed -E 's|^:[a-zA-Z][a-zA-Z0-9]*/||' | sed -E 's|^:[a-zA-Z][a-zA-Z0-9]*$||')
                if [ -z "$suffix_after_var" ]; then
                    # Just a variable, so it's the detail route itself
                    local route_name=$(to_snake_case "${last_namespace_part}_DETAIL")
                else
                    # Variable with suffix (e.g., /:id/image)
                    local suffix_name=$(echo "$suffix_after_var" | sed 's|/|_|g' | sed 's|-|_|g' | sed -E 's|:[a-zA-Z][a-zA-Z0-9]*|VAR|g')
                    local route_name=$(to_snake_case "${last_namespace_part}_DETAIL_${suffix_name}")
                fi
            else
                # Non-root path without leading variables - remove inline variables from naming
                # e.g. public/:id/image -> PUBLIC_IMAGE (not PUBLIC_:ID_IMAGE)
                local route_suffix=$(echo "$clean_path" | sed -E 's|:[a-zA-Z][a-zA-Z0-9]*||g' | sed 's|/|_|g' | sed 's|-|_|g')
                local route_name=$(to_snake_case "${last_namespace_part}_${route_suffix}")
            fi
            route_name=$(sanitize_route_name "$route_name")

            # Include file name and variables in route storage: route_name:route_path|file_name|variables
            routes+=("${route_name}:${route_path}|${file_name}|${route_variables}")
        done < "$grep_temp"

        rm -f "$grep_temp"
    done < "$find_routes_temp"

    rm -f "$find_routes_temp"

    # Output unique routes
    printf '%s\n' "${routes[@]}" | sort -u
}

# Start generating the routes file
cat > "${TEMP_FILE}" << 'EOF'
/**
 * This file is auto-generated by the generate-routes.sh script.
 * Do not edit this file manually.
 */

import { getModuleConfig } from './app-configs.js';

/* * */

export const PAGE_ROUTES = Object.freeze({

	root: {
		// BASE
		BASE: `${getModuleConfig('root', 'frontend_url')}`,

		// REFERENCE
		REFERENCE_LIST: `${getModuleConfig('root', 'frontend_url')}/reference`,
	},

EOF

# Process each module
# Use a temporary file to store module routes since associative arrays may not be available
MODULE_ROUTES_TEMP=$(mktemp)
trap "rm -f ${MODULE_ROUTES_TEMP}" EXIT

for module_dir in "${MODULES_DIR}"/*; do
    if [ ! -d "$module_dir" ]; then
        continue
    fi

    module_name=$(basename "$module_dir")

    # Skip if no apps directory
    if [ ! -d "${module_dir}/apps" ]; then
        continue
    fi

    printf "${YELLOW}Processing module: ${module_name}${NC}\n"

    frontend_app="${module_dir}/apps/frontend"
    api_app="${module_dir}/apps/api"

    # Collect routes for this module
    declare -a module_route_list=()

    # Scan frontend routes
    if [ -d "$frontend_app" ]; then
        printf "  Scanning frontend routes...\n"
        frontend_routes_temp=$(mktemp)
        scan_frontend_routes "$module_name" "$frontend_app" > "$frontend_routes_temp"
        while IFS= read -r route; do
            if [ -n "$route" ]; then
                module_route_list+=("$route")
            fi
        done < "$frontend_routes_temp"
        rm -f "$frontend_routes_temp"
    fi

    # Scan API routes
    if [ -d "$api_app" ] && [ -d "${api_app}/src/endpoints" ]; then
        printf "  Scanning API routes...\n"
        api_routes_temp=$(mktemp)
        scan_api_routes "$module_name" "${api_app}/src/endpoints" > "$api_routes_temp"
        while IFS= read -r route; do
            if [ -n "$route" ]; then
                module_route_list+=("$route")
            fi
        done < "$api_routes_temp"
        rm -f "$api_routes_temp"
    fi

    # Store routes for this module in temp file (one route per line with module prefix and type)
    # Format: module_name|type|route_name:route_path|file_name|variables (variables only for API routes)
    if [ ${#module_route_list[@]} -gt 0 ]; then
        for route in "${module_route_list[@]}"; do
            if [ -n "$route" ]; then
                # Extract route type from the route (check if it contains /api/)
                if [[ "$route" == *"/api/"* ]]; then
                    route_type="api"
                    # API routes have format: route_name:route_path|file_name|variables
                    # Count pipes to ensure format is correct
                    pipe_count=$(echo "$route" | grep -o '|' | wc -l | tr -d ' ')
                    if [ "$pipe_count" -eq 1 ]; then
                        # Missing variables field, add empty
                        route="${route}|"
                    fi
                else
                    route_type="frontend"
                    # For frontend routes, add empty file_name and empty variables
                    route="${route}||"
                fi
                printf '%s|%s|%s\n' "$module_name" "$route_type" "$route" >> "${MODULE_ROUTES_TEMP}"
            fi
        done
    fi
done

# Function to generate routes for a specific type (frontend or api)
generate_routes_for_type() {
    local route_type="$1"
    local output_file="$2"
    local first_module=true

    for module_name in $(cut -d'|' -f1 "${MODULE_ROUTES_TEMP}" | sort -u); do
        # Extract routes for this module and type
        module_routes_data=$(grep "^${module_name}|${route_type}|" "${MODULE_ROUTES_TEMP}" | cut -d'|' -f3-)

        if [ -z "$module_routes_data" ]; then
            continue
        fi

        if [ "$first_module" = false ]; then
            echo "" >> "$output_file"
        fi
        first_module=false

        printf "${GREEN}  Generating ${route_type} routes for: ${module_name}${NC}\n"

        # Convert module name to comment format (uppercase)
        module_comment_upper=$(echo "$module_name" | tr '[:lower:]' '[:upper:]')
        echo "" >> "$output_file"
        echo "	${module_name}: {" >> "$output_file"

        # Add BASE route at the beginning of each module group
        if [ "$route_type" = "api" ]; then
            echo "		// BASE" >> "$output_file"
            echo "		BASE: \`\${getModuleConfig('${module_name}', 'api_url')}\`," >> "$output_file"
        else
            echo "		// BASE" >> "$output_file"
            echo "		BASE: \`\${getModuleConfig('${module_name}', 'frontend_url')}\`," >> "$output_file"
        fi
        echo "" >> "$output_file"

        # Process routes, deduplicating by route name and grouping by file name
        route_temp=$(mktemp)
        # Write all routes to temp file first, then deduplicate
        echo "$module_routes_data" | sort -u > "${route_temp}.all"

        # Deduplicate by route name (keep first occurrence) and preserve file_name
        while IFS= read -r route_line; do
            if [ -z "$route_line" ]; then
                continue
            fi

            route_name=$(echo "$route_line" | cut -d':' -f1)

            # Only add if we haven't seen this route name yet
            if ! grep -q "^${route_name}:" "$route_temp" 2>/dev/null; then
                echo "$route_line" >> "$route_temp"
            fi
        done < "${route_temp}.all"

        rm -f "${route_temp}.all"

        # Sort routes by file_name (if present) to group routes from same file together
        # Format: route_name:route_path|file_name
        sort -t'|' -k2,2 -k1,1 "$route_temp" > "${route_temp}.sorted"
        mv "${route_temp}.sorted" "$route_temp"

        # Output routes, grouping by file name
        local previous_comment=""
        local first_route=true
        while IFS= read -r route_line; do
            if [ -z "$route_line" ]; then
                continue
            fi

            # Extract route_name, route_path, file_name, and variables
            route_name=$(echo "$route_line" | cut -d':' -f1)
            route_path_with_file=$(echo "$route_line" | cut -d':' -f2-)
            route_path=$(echo "$route_path_with_file" | cut -d'|' -f1)
            file_name=$(echo "$route_path_with_file" | cut -d'|' -f2)
            route_variables=$(echo "$route_path_with_file" | cut -d'|' -f3)

            # For API routes, use file_name for comment (convert to uppercase)
            # For frontend routes, derive comment from route name as before
            if [ "$route_type" = "api" ] && [ -n "$file_name" ]; then
                # Use file name as comment (all routes from same file share the same comment)
                comment_name=$(echo "$file_name" | tr '[:lower:]' '[:upper:]')
            else
                # Frontend routes or API routes without file_name - derive from route name
                # Remove common suffixes to get base name
                comment_name=$(echo "$route_name" | sed 's|_DETAIL$||' | sed 's|_LIST$||' | sed 's|_NEW_LIST$||' | sed 's|_NEW$||')
            fi

            # Output comment only when it changes, and add blank line between groups
            if [ "$comment_name" != "$previous_comment" ]; then
                if [ "$first_route" = false ]; then
                    # Add blank line between comment groups
                    echo "" >> "$output_file"
                fi
                echo "		// ${comment_name}" >> "$output_file"
                previous_comment="$comment_name"
            fi

            first_route=false

            # For API routes, use getModuleConfig and remove /module_name/api prefix
            if [ "$route_type" = "api" ]; then
                # Remove /module_name/api prefix from route_path
                # route_path format: /module_name/api/namespace/path
                # We want: namespace/path (without leading /module_name/api)
                clean_api_path=$(echo "$route_path" | sed "s|^/${module_name}/api/||")

                # Check if route contains any variables
                if [ -n "$route_variables" ]; then
                    # Generate function parameters from variables
                    # route_variables format: ":var1 :var2" (space-separated)
                    function_params=""
                    for var in $route_variables; do
                        if [ -n "$var" ]; then
                            # Remove leading : and use as parameter name
                            param_name=$(echo "$var" | sed 's|^:||')
                            if [ -z "$function_params" ]; then
                                function_params="${param_name}: string"
                            else
                                function_params="${function_params}, ${param_name}: string"
                            fi
                        fi
                    done
                    # Convert to function format with getModuleConfig
                    echo "		${route_name}: (${function_params}) => \`\${getModuleConfig('${module_name}', 'api_url')}/${clean_api_path}\`," >> "$output_file"
                else
                    # Regular string route with getModuleConfig
                    echo "		${route_name}: \`\${getModuleConfig('${module_name}', 'api_url')}/${clean_api_path}\`," >> "$output_file"
                fi
            else
                # Frontend routes - use getModuleConfig with frontend_url
                # Remove leading slash from route_path for concatenation
                clean_frontend_path=$(echo "$route_path" | sed 's|^/||')

                # Extract all parameters from the route path (e.g., ${id}, ${routeId})
                route_params=$(echo "$route_path" | grep -oE '\$\{[a-zA-Z][a-zA-Z0-9]*\}' | sed 's/[${}]//g' | sort -u)

                # Check if route contains any parameters
                if [ -n "$route_params" ]; then
                    # Build function parameters string
                    function_params=""
                    for param in $route_params; do
                        if [ -z "$function_params" ]; then
                            function_params="${param}: string"
                        else
                            function_params="${function_params}, ${param}: string"
                        fi
                    done
                    # Convert to function format with getModuleConfig
                    clean_path=$(echo "$clean_frontend_path" | sed 's|\\${\([^}]*\)}|${\1}|g')
                    echo "		${route_name}: (${function_params}) => \`\${getModuleConfig('${module_name}', 'frontend_url')}/${clean_path}\`," >> "$output_file"
                else
                    # Regular string route with getModuleConfig
                    # Handle root route (empty path) - use frontend_url directly without trailing slash
                    if [ -z "$clean_frontend_path" ]; then
                        echo "		${route_name}: \`\${getModuleConfig('${module_name}', 'frontend_url')}\`," >> "$output_file"
                    else
                        echo "		${route_name}: \`\${getModuleConfig('${module_name}', 'frontend_url')}/${clean_frontend_path}\`," >> "$output_file"
                    fi
                fi
            fi
        done < "$route_temp"

        rm -f "$route_temp"

        echo "	}," >> "$output_file"
    done
}

# Generate PAGE_ROUTES (frontend routes)
generate_routes_for_type "frontend" "${TEMP_FILE}"

# Close PAGE_ROUTES and start API_ROUTES
cat >> "${TEMP_FILE}" << 'EOF'
} as const);

export const API_ROUTES = Object.freeze({
EOF

# Generate API_ROUTES
generate_routes_for_type "api" "${TEMP_FILE}"

# Close API_ROUTES
cat >> "${TEMP_FILE}" << 'EOF'
} as const);
EOF

# Write to output file
mkdir -p "$(dirname "$OUTPUT_FILE")"
cp "${TEMP_FILE}" "${OUTPUT_FILE}"

printf "${GREEN}Routes generated successfully at: ${OUTPUT_FILE}${NC}\n"

