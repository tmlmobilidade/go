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
- Field: length
- Presence: optional
- Type: non-negative float

# Description

Horizontal length in meters of the pathway from the origin location (defined in from_stop_id) to the destination location (defined in to_stop_id).

This field is recommended for walkways (pathway_mode=1), fare gates (pathway_mode=6) and exit gates (pathway_mode=7).

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt
*/
func LengthValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_length_non_negative"
	ctx := lib.NewValidationContext("length", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("length")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	parsed, err := strconv.ParseFloat(value, 32)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}
	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative", float32(parsed)))
	}
	return nil
}
