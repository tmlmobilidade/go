package stops_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

func HasBenchValid(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_bench_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("has_bench", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the has_bench value

	value, err := db.Stops.Field("has_bench")
	if err != nil {
		return err
	}

	//
	// 4. Check if the has_bench is valid

	validValues := []string{"0", "1", "2", "3"}
	if !slices.Contains(validValues, value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}