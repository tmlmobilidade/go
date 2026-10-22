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
- Field: max_slope
- Presence: optional
- Type: float

# Description

Maximum slope ratio of the pathway. Valid options are:

0 or empty - No slope.
Float - Slope ratio of the pathway, positive for upwards, negative for downwards.

This field should only be used with walkways (pathway_mode=1) and moving sidewalks (pathway_mode=3).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func MaxSlopeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_max_slope_allowed_for_pathway_mode"
	ctx := lib.NewValidationContext("max_slope", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("max_slope")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	modeValue, err := db.Pathways.Field("pathway_mode")
	if err != nil {
		return err
	}
	mode, err := strconv.Atoi(modeValue)
	if err != nil {
		return nil
	}
	if mode != 1 && mode != 3 && value != "0" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed_pathway_mode", strconv.Itoa(mode)))
	}
	return nil
}
