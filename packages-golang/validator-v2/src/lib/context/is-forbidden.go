package context

import (
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/rules"
	types "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/context"
)

// IsForbidden reports whether the configured field or file is forbidden.
func IsForbidden(context *types.ValidationContext) bool {
	//

	//
	// 1. Check the configured severity

	return context.Config.Severity == rules.SEVERITY_FORBIDDEN
}
