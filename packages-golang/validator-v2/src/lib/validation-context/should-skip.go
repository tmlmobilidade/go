package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
)

// ShouldSkip reports whether the check should skip normal field validation.
func ShouldSkip(context *types.ValidationContext) bool {
	//
	// 1. Check the configured severity

	return ShouldIgnore(context) || IsForbidden(context)
}
