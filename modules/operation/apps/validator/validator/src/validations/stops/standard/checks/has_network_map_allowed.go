package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func HasNetworkMapAllowed(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_network_map_allowed"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("has_network_map_allowed", "stops.txt", ruleID, db.Row, services.AppMessageService)
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
	// 4. Check if the has_network_map follows the rule options

	if rulesContext != nil && rulesContext.Options != nil {
		if slices.Contains(*rulesContext.Options, types.ALL_OPTIONS) {
			return nil
		}
		
		if !slices.Contains(*rulesContext.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}