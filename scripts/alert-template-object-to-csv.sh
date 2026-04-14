#!/usr/bin/env bash
set -euo pipefail

# Converts descriptions.ts → CSV, copies to clipboard.
# Usage: ./alert-template-object-to-csv.sh <descriptions.ts>

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <descriptions.ts>" >&2
  exit 1
fi

INPUT="$1"

if [[ ! -f "$INPUT" ]]; then
  echo "Error: file not found: $INPUT" >&2
  exit 1
fi

OUTPUT="$(awk '
function quote_csv(s) {
    if (index(s, ",") || index(s, "\"") || index(s, "\n")) {
        gsub(/"/, "\"\"", s)
        return "\"" s "\""
    }
    return s
}

function extract_pt(line,    s, i, j) {
    i = index(line, "pt:")
    if (i == 0) return ""
    s = substr(line, i + 3)
    gsub(/^[[:space:]]*/, "", s)
    # remove leading quote
    if (substr(s, 1, 1) == "'\''") s = substr(s, 2)
    # remove trailing comma, quote, whitespace
    gsub(/[[:space:]]*,?[[:space:]]*$/, "", s)
    j = length(s)
    if (j > 0 && substr(s, j, 1) == "'\''") s = substr(s, 1, j - 1)
    return s
}

BEGIN {
    print "cause,effect,reference_type,title_pt_singular,title_pt_plural,description_pt_singular,description_pt_plural"
    state = "idle"
}

# Match key line with undefined
/^[[:space:]]*'\''[A-Z_]+:[A-Z_]+:[a-z]+'\'':[[:space:]]*undefined/ {
    key = $0
    gsub(/^[[:space:]]*'\''/, "", key)
    gsub(/'\''.*/, "", key)
    split(key, parts, ":")
    print parts[1] "," parts[2] "," parts[3] ",,,,"
    next
}

# Match key line with object
/^[[:space:]]*'\''[A-Z_]+:[A-Z_]+:[a-z]+'\'':[[:space:]]*\{/ {
    key = $0
    gsub(/^[[:space:]]*'\''/, "", key)
    gsub(/'\''.*/, "", key)
    split(key, parts, ":")
    cause = parts[1]
    effect = parts[2]
    ref_type = parts[3]
    state = "in_entry"
    section = ""
    plurality = ""
    desc_s = ""; desc_p = ""; tit_s = ""; tit_p = ""
    next
}

state == "in_entry" {
    if (/^[[:space:]]*description:[[:space:]]*\{/) { section = "description"; next }
    if (/^[[:space:]]*title:[[:space:]]*\{/)       { section = "title"; next }
    if (/^[[:space:]]*plural:[[:space:]]*\{/)       { plurality = "plural"; next }
    if (/^[[:space:]]*singular:[[:space:]]*\{/)     { plurality = "singular"; next }

    if (/pt:/) {
        val = extract_pt($0)
        if (section == "description" && plurality == "singular") desc_s = val
        if (section == "description" && plurality == "plural")   desc_p = val
        if (section == "title"       && plurality == "singular") tit_s = val
        if (section == "title"       && plurality == "plural")   tit_p = val
    }

    # Closing brace of entire entry (back to base indent)
    if (/^[[:space:]]*\},$/ || /^[[:space:]]*\}[[:space:]]*$/) {
        # Count leading tabs to detect entry-level close
        leading = $0
        gsub(/[^\t]/, "", leading)
        if (length(leading) <= 1) {
            print cause "," effect "," ref_type "," quote_csv(tit_s) "," quote_csv(tit_p) "," quote_csv(desc_s) "," quote_csv(desc_p)
            state = "idle"
        }
    }
}
' "$INPUT")"

if command -v pbcopy >/dev/null 2>&1; then
  if printf "%s" "$OUTPUT" | pbcopy 2>/dev/null; then
    echo "Copied to clipboard." >&2
  else
    printf "%s\n" "$OUTPUT"
  fi
else
  printf "%s\n" "$OUTPUT"
fi
