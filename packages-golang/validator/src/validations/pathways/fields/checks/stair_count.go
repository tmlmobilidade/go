package pathways_fields_checks

import (
	"main/lib"
	"main/services"
	"main/types"
)

func StairCountField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_stair_count_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("stair_count", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the stair_count value

	value, err := db.Pathways.Field("stair_count")
	if err != nil {
		return err
	}

	//
	// 4. Check if the stair_count is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
