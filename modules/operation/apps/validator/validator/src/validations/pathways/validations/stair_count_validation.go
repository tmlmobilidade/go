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

func StairCountValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("stair_count", "pathways.txt", "pathway_stair_count", row, services.AppMessageService)
	if rules != nil && rules.StairCount.Severity != "" {
		ctx.WithSeverity(rules.StairCount.Severity)
	}

	if pathways.StairCount == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("stair_count_validation.required", "stair_count_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("stair_count_validation.forbidden"))
		return
	}
}
