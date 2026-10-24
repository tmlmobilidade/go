package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func PlatformCodeAllowed(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	
	//
	// 1. Get the rule

	const ruleID = "stops_platform_code_allowed"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("platform_code", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the platform_code value

	value, err := db.Stops.Field("platform_code")
	if err != nil {
		return err
	}

	//
	// 4. Check if the platform_code follows the rule options

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