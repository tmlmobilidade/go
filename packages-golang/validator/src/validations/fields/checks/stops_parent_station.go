package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func ParentStationField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_parent_station_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("parent_station", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the parent_station value

	value, err := db.Stops.Field("parent_station")
	if err != nil {
		return err
	}

	//
	// 4. Check if the parent_station is present

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return success

	return nil
}
