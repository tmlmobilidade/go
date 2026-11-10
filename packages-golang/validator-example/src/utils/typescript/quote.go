package utils

import "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"

// Quote renders a single-quoted TypeScript string literal.
func Quote(value string) string {
	return "'" + variables.TsStringEscaper.Replace(value) + "'"
}
