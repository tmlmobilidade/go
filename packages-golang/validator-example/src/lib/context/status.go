package context

import (
	algorithmtypes "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/algorithm"
	types "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/context"
)

// Status returns the rule context outcome after its callback finishes.
// Missing inputs mark it Skipped; findings or operational failures mark it Failed.
func Status(context *types.ValidationContext) types.RuleStatus {
	//

	//
	// 1. Return the outcome of this check invocation

	if context.Failed {
		return algorithmtypes.Failed
	}
	if context.Skipped {
		return algorithmtypes.Skipped
	}

	return algorithmtypes.Passed
}
