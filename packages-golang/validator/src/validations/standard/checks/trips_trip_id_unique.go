package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func TripIdUnique(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_trip_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("trip_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Check if the trip_id is unique

	value, count, err := db.Trips.FieldWithCount("trip_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the trip_id is unique

	if count > 1 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("duplicate", value))
	}

	//
	// 5. Return success

	return nil
}
