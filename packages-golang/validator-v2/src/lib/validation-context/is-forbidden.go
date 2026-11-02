package validationcontext

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
)

// IsForbidden reports whether the configured field or file is forbidden.
func IsForbidden(context *types.ValidationContext) bool {
	//
	// 1. Check the configured severity

	return context.Severity == rules.SEVERITY_FORBIDDEN
}
