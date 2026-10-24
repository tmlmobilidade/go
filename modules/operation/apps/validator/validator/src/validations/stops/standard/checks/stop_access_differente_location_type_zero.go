package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func StopAccessDifferenteLocationTypeZero(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_stop_access_differente_location_type_zero"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_access", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the location_type value

	locationType, err := db.Stops.Field("location_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the location_type is 0

	if locationType != "0" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 5. Return success

	return nil
}