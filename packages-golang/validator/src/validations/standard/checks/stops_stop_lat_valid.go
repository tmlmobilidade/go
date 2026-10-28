package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

func StopLatValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_stop_lat_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_lat", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_lat value

	value, err := db.Stops.Field("stop_lat")
	if err != nil {
		return err
	}

	//
	// 4. Convert the stop_lat to a float

	number, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return err
	}

	//
	// 5. Check if the stop_lat is a valid latitude

	if !lib.ValidateLatitude(number) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Return success

	return nil
}
