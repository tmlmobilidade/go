package context

import (
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
	"github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"
)

// IsForbidden reports whether the configured field or file is forbidden.
func IsForbidden(context *types.ValidationContext) bool {
	//

	//
	// 1. Check the configured severity

	return context.Config.Severity == rules.SEVERITY_FORBIDDEN
}
