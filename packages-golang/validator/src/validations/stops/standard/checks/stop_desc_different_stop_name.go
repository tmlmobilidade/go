package stops_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func StopDescDifferentStopName(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_stop_desc_different_stop_name"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_desc", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the stop_desc value

	value, err := db.Stops.Field("stop_desc")
	if err != nil {
		return err
	}

	//
	// 4. Get the stop_name value

	stopName, err := db.Stops.Field("stop_name")
	if err != nil {
		return err
	}

	//
	// 5. Check if the stop_desc is different from the stop_name

	if value == stopName {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value, stopName))
		return nil
	}

	//
	// 6. Return success

	return nil
}
