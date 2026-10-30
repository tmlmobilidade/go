package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func ParentStationForeign(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_parent_station_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("parent_station", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the parent_station value

	value, count, err := db.Stops.FieldWithCount("parent_station")
	if err != nil {
		return err
	}

	//
	// 4. Check if the parent_station is a foreign key

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate"), value)
		return nil
	}

	//
	// 5. Return success

	return nil
}
