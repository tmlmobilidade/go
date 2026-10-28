package stop_times_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

func ShapeDistTraveledValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_shape_dist_traveled_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shape_dist_traveled", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the shape_dist_traveled value

	value, err := db.StopTimes.Field("shape_dist_traveled")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shape_dist_traveled is valid

	sd, err := strconv.ParseFloat(value, 64)
	if err != nil {
		return err
	}

	if sd < 0 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
