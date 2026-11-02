package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func LocationGroupIdForbidden(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_location_group_id_forbidden"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("location_group_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the location_group_id value

	value, err := db.StopTimes.Field("location_group_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}

	//
	// 4. Check if the location_group_id is forbidden

	// These are values on the current stop_time, not IDs found elsewhere in the table.
	stopID, err := db.StopTimes.Field("stop_id")
	if err != nil {
		return err
	}

	//
	// 5. Get the other location_id value

	otherLocation, err := db.StopTimes.Field("location_id")
	if err != nil {
		return err
	}

	//
	// 6. Check if the location_group_id is forbidden

	if stopID != "" || otherLocation != "" {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
	}

	//
	// 7. Return success

	return nil
}
