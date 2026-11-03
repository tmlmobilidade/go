package utils

import "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/script/typescript/consts"

// Quote renders a single-quoted TypeScript string literal.
func Quote(value string) string {
	return "'" + consts.TsStringEscaper.Replace(value) + "'"
}
