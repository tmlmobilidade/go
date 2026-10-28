package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func ParentStationEmptyLocationTypes(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_parent_station_empty_location_types"

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

	parentStation, err := db.Stops.Field("parent_station")
	if err != nil {
		return err
	}

	//
	// 4. Check if the location_type is 0 (Stop/Platform)

	// Validate Parent Station for Location Type 2 (Entrance/Exit), 3 (Generic Node), or 4 (Boarding Area)
	if (locationType == "2" || locationType == "3" || locationType == "4") && parentStation == "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("required_location_type"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
