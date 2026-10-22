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
- Field: min_width
- Presence: optional
- Type: positive float

# Description

Minimum width of the pathway in meters.

This field is recommended if the minimum width is less than 1 meter.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func MinWidthValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_min_width_positive"
	ctx := lib.NewValidationContext("min_width", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("min_width")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative"))
		return nil
	}
	if parsed < 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))
	}
	return nil
}
