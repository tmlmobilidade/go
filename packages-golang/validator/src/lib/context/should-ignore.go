package context

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// ShouldIgnore reports whether the configured severity is ignore.
func ShouldIgnore(context *types.ValidationContext) bool {
	//

	//
	// 1. Check the configured severity

	return context.Config.Severity == rules.SEVERITY_IGNORE
}
