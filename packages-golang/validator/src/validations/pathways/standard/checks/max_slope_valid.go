package pathways_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_max_slope_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("max_slope", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the max_slope value

	value, err := db.Pathways.Field("max_slope")
	if err != nil {
		return err
	}

	//
	// 4. Skip empty max_slope values

	if value == "" {
		return nil
	}

	//
	// 5. Get the pathway_mode value

	modeValue, err := db.Pathways.Field("pathway_mode")
	if err != nil {
		return err
	}

	//
	// 6. Convert the pathway_mode to an integer

	mode, err := strconv.Atoi(modeValue)
	if err != nil {
		return nil
	}

	//
	// 7. Check if the pathway mode allows max_slope

	if mode != 1 && mode != 3 && value != "0" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed_pathway_mode", strconv.Itoa(mode)))
	}

	//
	// 8. Return success

	return nil
}
