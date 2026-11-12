package context

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// GetSeverityMessage selects required, recommended, or informational wording.
func GetSeverityMessage(context *types.ValidationContext, requiredKey, recommendedKey, informationalKey string) string {
	//

	//
	// 1. Select the translated message for the configured severity

	if context.Config.Severity == rules.SEVERITY_ERROR {
		return GetTranslatedMessage(context, requiredKey)
	}

	//
	// 2. Select the translated message for the recommended severity

	if context.Config.Severity == rules.SEVERITY_WARNING {
		return GetTranslatedMessage(context, recommendedKey)
	}

	//
	// 3. Select the translated message for the informational severity

	return GetTranslatedMessage(context, informationalKey)
}
