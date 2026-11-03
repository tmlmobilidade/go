package context

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
)

// GetRequiredMessage selects the required message for errors and recommended otherwise.
func GetRequiredMessage(context *types.ValidationContext, requiredKey, recommendedKey string) string {
	//

	//
	// 1. Select the translated message for the configured severity

	if context.Config.Severity == rules.SEVERITY_ERROR {
		return GetTranslatedMessage(context, requiredKey)
	}
	return GetTranslatedMessage(context, recommendedKey)
}
