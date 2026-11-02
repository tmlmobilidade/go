package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// ShouldIgnore reports whether the configured severity is ignore.
func ShouldIgnore(context *types.ValidationContext) bool {
	//

	//
	// 1. Check the configured severity

	return context.Severity == rules.SEVERITY_IGNORE
}
