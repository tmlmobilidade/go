package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func PublicVisibleValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	
	//
	// 1. Get the rule

	const ruleID = "stops_public_visible_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("public_visible_valid", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the public_visible value

	value, err := db.Stops.Field("public_visible")
	if err != nil {
		return err
	}

	//
	// 4. Check if the public_visible is valid

	validValues := []string{"0", "1"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}