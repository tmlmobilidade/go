package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
- File: [pathways.txt]
- Field: stair_count
- Presence: optional
- Type: non-null integer

# Description

Number of stairs in the pathway.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/

func StairCountValidation(pathways *types.Pathways, row int, rules *types.RuleContext) {
	ctx := lib.NewValidationContext("stair_count", "pathways.txt", "pathway_stair_count", row, services.AppMessageService, rules)

	// 1. Validate stair_count is present
	if pathways.StairCount == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate stair_count is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}
}
