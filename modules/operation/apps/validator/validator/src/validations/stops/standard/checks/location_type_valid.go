package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func LocationTypeValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	// 1. Get the rule

	const ruleID = "stops_location_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("location_type_valid", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the location_type value

	value, err := db.Stops.Field("location_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the location_type is valid

	validValues := []string{"0", "1", "2", "3", "4"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Return success

	return nil
}