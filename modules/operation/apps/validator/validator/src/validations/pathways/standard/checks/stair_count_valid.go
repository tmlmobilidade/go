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
	const ruleID = "pathway_stair_count"
	ctx := lib.NewValidationContext("stair_count", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("stair_count")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	if _, err := strconv.ParseUint(value, 10, 16); err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
	}
	return nil
}
