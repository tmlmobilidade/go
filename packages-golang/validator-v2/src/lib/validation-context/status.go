package validationcontext

import (
	algorithmtypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/rules/algorithm/types"
	"github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/validation-context/types"
)

// Status returns Failed after any info, warning, or error finding was emitted.
// Otherwise it returns Passed; the scheduler separately decides whether to skip a rule.
func Status(context *types.ValidationContext) types.RuleStatus {
	//

	//
	// 1. Return the outcome of this check invocation

	if context.Failed {
		return algorithmtypes.Failed
	}

	return algorithmtypes.Passed
}
