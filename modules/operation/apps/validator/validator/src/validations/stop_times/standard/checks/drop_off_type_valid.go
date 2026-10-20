package stop_times_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

func DropOffTypeValid(db *services.SQLiteContext, rules *types.StopTimesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stop_times_drop_off_type_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("drop_off_type", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the drop_off_type value

	value, err := db.StopTimes.Field("drop_off_type")
	if err != nil {
		return err
	}

	//
	// 4. Check if the drop_off_type is valid

	dt, err := strconv.Atoi(value)
	if err != nil {
		return err
	}

	if dt < 0 || dt > 3 {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}	

	//
	// 5. Return success

	return nil
}