package validators

import (
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/variables"
)

func ValidateLanguage(lang string) bool {
	return slices.Contains(variables.SupportedLanguageCodes, strings.ToLower(lang))
}
