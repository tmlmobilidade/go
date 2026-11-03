package context

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/i18n"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
)

// GetTranslatedMessage resolves a detail key under the context's rule ID.
// Arguments fill placeholders in the translated message.
func GetTranslatedMessage(context *types.ValidationContext, key string, args ...any) string {
	//

	//
	// 1. Resolve the rule's translation key and format the message

	return i18n.AppTranslator.Get(context.RuleID+"."+key, args...)
}
