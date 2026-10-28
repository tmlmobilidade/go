package stops_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func StopAccessForbiddenParentStation(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_stop_access_forbidden_parent_station"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stop_access", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the parent_station value

	parentStation, err := db.Stops.Field("parent_station")
	if err != nil {
		return err
	}

	//
	// 4. Check if the parent_station is empty

	if parentStation == "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
