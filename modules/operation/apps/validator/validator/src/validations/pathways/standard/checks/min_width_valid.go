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
	//

	//
	// 1. Get the rule

	const ruleID = "pathway_min_width_positive"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("min_width", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the min_width value

	value, err := db.Pathways.Field("min_width")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty min_width values

	if value == "" {
		return nil
	}

	//
	// 5. Convert the min_width to a float

	parsed, err := strconv.ParseFloat(value, 64)
	if err != nil {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Check if the min_width is non-negative

	if parsed < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("negative"))
		return nil
	}

	//
	// 7. Check if the min_width needs a recommendation

	if parsed < 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))
	}

	//
	// 8. Return success

	return nil
}
