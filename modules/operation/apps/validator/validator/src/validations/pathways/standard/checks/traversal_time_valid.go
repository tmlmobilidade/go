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
	//

	//
	// 1. Get the rule

	const ruleID = "pathway_traversal_time_non_negative_seconds"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("traversal_time", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the traversal_time value

	value, err := db.Pathways.Field("traversal_time")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty traversal_time values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the traversal_time to an integer

	parsed, err := strconv.Atoi(value)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the traversal_time is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative", strconv.Itoa(parsed)))
	}

	//
	// 7. Return success

	return nil
}
