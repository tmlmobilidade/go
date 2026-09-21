package pathways

import (
	"main/lib"
	"main/services"
	"main/types"
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

	if pathways.TraversalTime == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("traversal_time_validation.required", "traversal_time_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("traversal_time_validation.forbidden"))
		return
	}

	if *pathways.TraversalTime < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("traversal_time_validation.negative", *pathways.TraversalTime))
		return
	}
}
