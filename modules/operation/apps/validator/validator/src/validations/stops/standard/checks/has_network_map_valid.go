package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func HasNetworkMapValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_network_map_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("has_network_map", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the has_network_map value

	value, err := db.Stops.Field("has_network_map")
	if err != nil {
		return err
	}

	//
	// 4. Check if the has_network_map is valid

	validValues := []string{"0", "1", "2", "3"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}