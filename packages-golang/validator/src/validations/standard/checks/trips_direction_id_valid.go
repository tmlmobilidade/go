package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
)

func DirectionIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_direction_id_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("direction_id", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the direction_id value

	value, err := db.Trips.Field("direction_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the direction_id is required

	if value == "" {
		return nil
	}

	//
	// 5. Parse the direction_id value

	validValues := []string{"0", "1"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 6. Return success

	return nil
}
