package standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"slices"
)

func HasSchedulesAllowed(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_has_schedules_allowed"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("has_schedules", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the has_schedules value

	value, err := db.Stops.Field("has_schedules")
	if err != nil {
		return err
	}

	//
	// 4. Check if the has_schedules follows the rule options

	if rulesContext != nil && rulesContext.Options != nil {
		if slices.Contains(*rulesContext.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rulesContext.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}
