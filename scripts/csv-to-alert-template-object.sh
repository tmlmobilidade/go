#!/usr/bin/env bash
set -euo pipefail

# Converts alert-template CSV → TS-style object, copies to clipboard.
# Fields with commas MUST be quoted (RFC 4180).
#
# Required CSV columns:
#   cause, effect, reference_type,
#   title_pt_singular, title_pt_plural,
#   description_pt_singular, description_pt_plural

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <input.csv>" >&2
  exit 1
fi

INPUT_CSV="$1"

if [[ ! -f "$INPUT_CSV" ]]; then
  echo "Error: file not found: $INPUT_CSV" >&2
  exit 1
fi

OUTPUT="$(awk -v q="'" '
function csv_parse(line, f,    nf, i, c, in_q, fld) {
    nf = 0; in_q = 0; fld = ""
    for (i = 1; i <= length(line); i++) {
        c = substr(line, i, 1)
        if (in_q) {
            if (c == "\"") {
                if (substr(line, i+1, 1) == "\"") { fld = fld "\""; i++ }
                else in_q = 0
            } else fld = fld c
        } else if (c == "\"") in_q = 1
        else if (c == ",") { nf++; f[nf] = fld; fld = "" }
        else fld = fld c
    }
    f[++nf] = fld
    return nf
}

function esc(s) { gsub(/\\/, "\\\\", s); gsub(q, "\\" q, s); return s }
function trim(s) { gsub(/^[[:space:]]+/, "", s); gsub(/[[:space:]]+$/, "", s); return s }

NR == 1 {
    gsub(/\xef\xbb\xbf/, "")
    csv_parse($0, hdr)
    next
}

{
    nf = csv_parse($0, f)
    if (nf < 7) next

    key    = f[1] ":" f[2] ":" f[3]
    tit_s  = trim(f[4])
    tit_p  = trim(f[5])
    desc_s = trim(f[6])
    desc_p = trim(f[7])

    if (n++ > 0) printf ",\n\n"

    printf "    %s%s%s: {\n",                              q, esc(key), q
    printf "        description: {\n"
    printf "            plural: {\n"
    printf "                en: %snot-available%s,\n",      q, q
    printf "                pt: %s%s%s,\n",                 q, esc(desc_p), q
    printf "            },\n"
    printf "            singular: {\n"
    printf "                en: %snot-available%s,\n",      q, q
    printf "                pt: %s%s%s,\n",                 q, esc(desc_s), q
    printf "            },\n"
    printf "        },\n"
    printf "        title: {\n"
    printf "            plural: {\n"
    printf "                en: %snot-available%s,\n",      q, q
    printf "                pt: %s%s%s,\n",                 q, esc(tit_p), q
    printf "            },\n"
    printf "            singular: {\n"
    printf "                en: %snot-available%s,\n",      q, q
    printf "                pt: %s%s%s,\n",                 q, esc(tit_s), q
    printf "            },\n"
    printf "        },\n"
    printf "    }"
}

BEGIN { n = 0; printf "{\n" }
END   { printf "\n}\n" }
' "$INPUT_CSV")"

if command -v pbcopy >/dev/null 2>&1; then
  if printf "%s" "$OUTPUT" | pbcopy 2>/dev/null; then
    echo "Copied to clipboard." >&2
  else
    printf "%s\n" "$OUTPUT"
  fi
else
  printf "%s\n" "$OUTPUT"
fi
