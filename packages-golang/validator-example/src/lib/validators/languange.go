package validators

import (
	"slices"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/variables"
)

func ValidateLanguage(lang string) bool {
	//

	//
	// 1. Check if the language is supported

	return slices.Contains(variables.SupportedLanguageCodes, strings.ToLower(lang))
}
