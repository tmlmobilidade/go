package context

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
)

// ShouldIgnore reports whether the configured severity is ignore.
func ShouldIgnore(context *types.ValidationContext) bool {
	//

	//
	// 1. Check the configured severity

	return context.Config.Severity == rules.SEVERITY_IGNORE
}
