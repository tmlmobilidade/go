package pathways_fields_checks

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

func LengthField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_length_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("length", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the length value

	value, err := db.Pathways.Field("length")
	if err != nil {
		return err
	}

	//
	// 4. Check if the length is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		modeValue, err := db.Pathways.Field("pathway_mode")
		if err != nil {
			return err
		}
		mode, parseErr := strconv.Atoi(modeValue)
		if parseErr == nil && (mode == 1 || mode == 6 || mode == 7) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("recommended"))
			return nil
		}
		ctx.AddMessageWithSeverity(ctx.GetSeverityMessage("required", "recommended", "informational"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
