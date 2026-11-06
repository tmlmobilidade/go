package validators

import (
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/variables"
)

func ValidateLanguage(lang string) bool {
	return slices.Contains(variables.SupportedLanguageCodes, strings.ToLower(lang))
}
