package pathways_fields_checks

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ReversedSignpostedAsField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_reversed_signposted_as_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("reversed_signposted_as", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the reversed_signposted_as value

	value, err := db.Pathways.Field("reversed_signposted_as")
	if err != nil {
		return err
	}

	//
	// 4. Check if the reversed_signposted_as is required

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
