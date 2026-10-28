package stops_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
)

func WheelchairBoardingValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_wheelchair_boarding_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("wheelchair_boarding", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the wheelchair_boarding value

	value, err := db.Stops.Field("wheelchair_boarding")
	if err != nil {
		return err
	}

	//
	// 4. Check if the wheelchair_boarding is valid

	validValues := []string{"0", "1", "2"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
