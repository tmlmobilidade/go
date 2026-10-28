package stop_times_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func TripIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//
	// 1. Get the rule

	const ruleID = "stop_times_trip_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("trip_id", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the trip_id value

	value, err := db.StopTimes.Field("trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the trip_id is foreign

	if !db.Trips.Exists("trip_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
