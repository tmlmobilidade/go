package stop_times_standard

import (
	"main/types"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
)

func LocationIdForbidden(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Create the validation context

	const ruleID = "stop_times_location_id_forbidden"
	ctx := lib.NewValidationContext("location_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 2. Get the location_id value

	value, err := db.StopTimes.Field("location_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}

	//
	// 3. Get the stop_id value

	// These are values on the current stop_time, not IDs found elsewhere in the table.
	stopID, err := db.StopTimes.Field("stop_id")
	if err != nil {
		return err
	}

	//
	// 4. Get the location_group_id value

	otherLocation, err := db.StopTimes.Field("location_group_id")
	if err != nil {
		return err
	}

	//
	// 5. Check if the location_id is forbidden

	if stopID != "" || otherLocation != "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
	}

	//
	// 6. Return success

	return nil
}
