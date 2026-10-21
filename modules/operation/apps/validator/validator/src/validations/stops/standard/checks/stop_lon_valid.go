package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

func StopLonValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//
	
	//
	// 1. Get the rule

	const ruleID = "stops_stop_lon_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_lon_valid", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_lon value

	value, err := db.Stops.Field("stop_lon")
	if err != nil {
		return err
	}


	//
	// 4. Convert the stop_lon to a float

	number, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return err
	}
	
	// 
	// 5. Check if the stop_lon is a valid longitude

	if !lib.ValidateLongitude(number) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}