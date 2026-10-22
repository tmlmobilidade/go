package pathways_standard

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
func TraversalTimeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_traversal_time_non_negative_seconds"
	ctx := lib.NewValidationContext("traversal_time", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("traversal_time")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative", strconv.Itoa(parsed)))
	}
	return nil
}
