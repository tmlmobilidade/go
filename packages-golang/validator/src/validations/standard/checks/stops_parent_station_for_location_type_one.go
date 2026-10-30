package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func ParentStationForLocationTypeOne(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_parent_station_for_location_type_one"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("parent_station", "stops.txt", ruleID, db.Row, services.AppMessageService)
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
	// 4. Check if the location_type is 1 (Station)

	if locationType != "1" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
