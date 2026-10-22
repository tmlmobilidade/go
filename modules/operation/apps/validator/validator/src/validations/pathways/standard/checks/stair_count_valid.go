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
- Field: stair_count
- Presence: optional
- Type: non-null integer

# Description

Number of stairs in the pathway.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func StairCountValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathway_stair_count"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stair_count", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the stair_count value

	value, err := db.Pathways.Field("stair_count")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty stair_count values

	if value == "" {
		return nil
	}

	//
	// 5. Check if the stair_count is a valid unsigned integer

	if _, err := strconv.ParseUint(value, 10, 16); err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}

	//
	// 6. Return success

	return nil
}
