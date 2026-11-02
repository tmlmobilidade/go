package utils

import "strings"

var tsStringEscaper = strings.NewReplacer(`\`, `\\`, "'", `\'`, "\n", `\n`, "\r", `\r`)

// Quote renders a single-quoted TypeScript string literal.
func Quote(value string) string {
	return "'" + tsStringEscaper.Replace(value) + "'"
}
