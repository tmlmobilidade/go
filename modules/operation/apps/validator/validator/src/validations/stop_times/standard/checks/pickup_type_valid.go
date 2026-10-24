package stop_times_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

func PickupTypeValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_pickup_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("pickup_type", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the pickup_type value
	value, err := db.StopTimes.Field("pickup_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the pickup_type is valid

	pt, err := strconv.Atoi(value)
	if err != nil {
		return err
	}

	if pt < 0 || pt > 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
