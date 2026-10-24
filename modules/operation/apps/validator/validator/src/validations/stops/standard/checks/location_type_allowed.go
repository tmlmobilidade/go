package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func LocationTypeAllowed(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	// 1. Get the rule

	const ruleID = "stops_location_type_allowed"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("location_type", "stops.txt", ruleID, db.Row, services.AppMessageService)
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
	// 4. Check if the location_type follows the rule options

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