package context

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
)

// GetRequiredMessage selects the required message for errors and recommended otherwise.
func GetRequiredMessage(context *types.ValidationContext, requiredKey, recommendedKey string) string {
	//

	//
	// 1. Select the translated message for the configured severity

	if context.Config.Severity == rules.SEVERITY_ERROR {
		return GetTranslatedMessage(context, requiredKey)
	}

	//
	// 2. Return the translated message for the recommended severity

	return GetTranslatedMessage(context, recommendedKey)
}
