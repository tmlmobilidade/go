package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/validation-context"
)

// GetSeverityMessage selects required, recommended, or informational wording.
func GetSeverityMessage(context *types.ValidationContext, requiredKey, recommendedKey, informationalKey string) string {
	//

	//
	// 1. Select the translated message for the configured severity

	if context.Config.Severity == rules.SEVERITY_ERROR {
		return GetTranslatedMessage(context, requiredKey)
	}
	if context.Config.Severity == rules.SEVERITY_WARNING {
		return GetTranslatedMessage(context, recommendedKey)
	}
	return GetTranslatedMessage(context, informationalKey)
}
