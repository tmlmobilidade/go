package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes

- File: [pathways.txt]
- Field: traversal_time
- Presence: optional
- Type: Positive integer

# Description

Time in seconds required to traverse the pathway from the origin location (defined in from_stop_id) to the destination location (defined in to_stop_id).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func TraversalTimeValidation(pathways *types.Pathways, row int, rules *types.PathwaysRules) {
	ctx := lib.NewValidationContext("traversal_time", "pathways.txt", "pathway_traversal_time_non_negative_seconds", row, services.AppMessageService)
	if rules != nil && rules.TraversalTime.Severity != "" {
		ctx.WithSeverity(rules.TraversalTime.Severity)
	}

	// 1. Validate traversal_time is present
	if pathways.TraversalTime == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate traversal_time is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return
	}

	// 3. Validate traversal_time is a valid traversal_time
	if *pathways.TraversalTime < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative", strconv.Itoa(*pathways.TraversalTime)))
		return
	}
}
