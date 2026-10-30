package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
)

func TripsWheelchairAccessibleValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "trips_wheelchair_accessible_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("wheelchair_accessible", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the wheelchair_accessible value

	value, err := db.Trips.Field("wheelchair_accessible")
	if err != nil {
		return err
	}

	//
	// 4. Parse the wheelchair_accessible value

	validValues := []string{"0", "1", "2"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
