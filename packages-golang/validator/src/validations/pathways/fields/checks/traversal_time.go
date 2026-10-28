package pathways_fields_checks

import (
	"main/lib"
	"main/services"
	"main/types"
)

func TraversalTimeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_traversal_time_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("traversal_time", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the traversal_time value

	value, err := db.Pathways.Field("traversal_time")
	if err != nil {
		return err
	}

	//
	// 4. Check if the traversal_time is required

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
