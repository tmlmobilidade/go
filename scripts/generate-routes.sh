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
    echo "$1" | sed 's|\.|_|g' | sed 's|/|_|g' | sed 's|-|_|g' | sed 's|__|_|g' | sed 's|^_||' | sed 's|_$||'
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
        
        # Remove route groups like (authenticated)
        dir_path=$(echo "$dir_path" | sed -E 's|\([^)]+\)/||g' | sed 's|^/||')
        
        # Check if path contains [id] (detail route)
        if [[ "$dir_path" == *"[id]"* ]]; then
            # Extract base path before [id]
            local base_path=$(echo "$dir_path" | sed 's|/\[id\].*||' | sed 's|\[id\].*||')
            if [ -z "$base_path" ]; then
                # Handle case where [id] is the directory name itself
                base_path=$(echo "$dir_path" | sed 's|\[id\]||g' | sed 's|/$||')
            fi
            local route_name=$(to_snake_case "${base_path}_DETAIL")
            route_name=$(sanitize_route_name "$route_name")
            local route_path="/${module_name}/${base_path}/\${id}"
            routes+=("${route_name}:${route_path}")
        else
            # It's a list route
            local route_name=$(to_snake_case "${dir_path}_LIST")
            route_name=$(sanitize_route_name "$route_name")
            local route_path="/${module_name}/${dir_path}"
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
            
            # Use endpoint_name (folder name) for route path, not namespace
            # This matches the pattern: /module_name/endpoint_name
            
            # Handle root path (/)
            # Add /api to API routes
            if [ "$path" = "/" ]; then
                local route_name=$(to_snake_case "${endpoint_name}_LIST")
                local route_path="/${module_name}/api/${endpoint_name}"
                routes+=("${route_name}:${route_path}")
                continue
            fi
            
            # Handle detail routes (:id or /:id)
            if [[ "$path" == *":id"* ]]; then
                # Extract suffix after :id (e.g., /image from /:id/image)
                local suffix=$(echo "$path" | sed 's|.*:id||' | sed 's|^/||')
                
                # Build the route path (add /api for API routes)
                if [ -z "$suffix" ]; then
                    # Just :id means it's the endpoint itself
                    local route_path="/${module_name}/api/${endpoint_name}/\${id}"
                else
                    # Path like /:id/image means endpoint/:id/suffix
                    local route_path="/${module_name}/api/${endpoint_name}/\${id}/${suffix}"
                fi
                
                # Create route name
                if [ -z "$suffix" ]; then
                    local route_name=$(to_snake_case "${endpoint_name}_DETAIL")
                else
                    local suffix_name=$(echo "$suffix" | sed 's|/|_|g' | sed 's|-|_|g')
                    local route_name=$(to_snake_case "${endpoint_name}_DETAIL_${suffix_name}")
                fi
                route_name=$(sanitize_route_name "$route_name")
                routes+=("${route_name}:${route_path}")
            else
                # Regular route (not :id)
                local clean_path=$(echo "$path" | sed 's|^/||')
                # Create route name from endpoint name and path
                local route_suffix=$(echo "$clean_path" | sed 's|/|_|g' | sed 's|-|_|g')
                local route_name=$(to_snake_case "${endpoint_name}_${route_suffix}")
                route_name=$(sanitize_route_name "$route_name")
                # Add /api for API routes
                local route_path="/${module_name}/api/${endpoint_name}/${clean_path}"
                routes+=("${route_name}:${route_path}")
            fi
        done < "$grep_temp"
        
        rm -f "$grep_temp"
    done < "$find_routes_temp"
    
    rm -f "$find_routes_temp"
    
    # Output unique routes
    printf '%s\n' "${routes[@]}" | sort -u
}

# Start generating the routes file
cat > "${TEMP_FILE}" << 'EOF'
export const PAGE_ROUTES = Object.freeze({
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
    # Format: module_name|type|route_name:route_path
    if [ ${#module_route_list[@]} -gt 0 ]; then
        for route in "${module_route_list[@]}"; do
            if [ -n "$route" ]; then
                # Extract route type from the route (check if it contains /api/)
                if [[ "$route" == *"/api/"* ]]; then
                    route_type="api"
                else
                    route_type="frontend"
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
        echo "	/* * */" >> "$output_file"
        echo "	/* ${module_comment_upper} */" >> "$output_file"
        echo "	${module_name}: {" >> "$output_file"
        
        # Process routes, deduplicating by route name
        route_temp=$(mktemp)
        # Write all routes to temp file first, then deduplicate
        echo "$module_routes_data" | sort -u > "${route_temp}.all"
        
        # Deduplicate by route name (keep first occurrence)
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
        
        # Output routes
        while IFS= read -r route_line; do
            if [ -z "$route_line" ]; then
                continue
            fi
            
            route_name=$(echo "$route_line" | cut -d':' -f1)
            route_path=$(echo "$route_line" | cut -d':' -f2-)
            
            # For API routes, ensure /api/ is in the path (it should already be there from scan_api_routes)
            # For frontend routes, keep as-is
            
            # Determine route type for comment
            if [[ "$route_name" == *"_DETAIL" ]]; then
                comment_name=$(echo "$route_name" | sed 's|_DETAIL||')
            elif [[ "$route_name" == *"_LIST" ]]; then
                comment_name=$(echo "$route_name" | sed 's|_LIST||')
            else
                comment_name="$route_name"
            fi
            
            # Check if it's a detail route (contains ${id})
            if [[ "$route_path" == *"\${id}"* ]] || [[ "$route_path" == *'${id}'* ]]; then
                # Convert to function format
                clean_path=$(echo "$route_path" | sed 's|\\${id}|${id}|g' | sed "s|\${id}|\${id}|g")
                echo "		// ${comment_name}" >> "$output_file"
                echo "		${route_name}: (id: string) => \`${clean_path}\`," >> "$output_file"
            else
                # Regular string route
                echo "		// ${comment_name}" >> "$output_file"
                echo "		${route_name}: '${route_path}'," >> "$output_file"
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

