package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
	"strconv"
)

func MaxSlopeField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "pathways_max_slope_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("max_slope", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the max_slope value

	value, err := db.Pathways.Field("max_slope")
	if err != nil {
		return err
	}

	//
	// 4. Check if the max_slope is required

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		modeValue, err := db.Pathways.Field("pathway_mode")
		if err != nil {
			return err
		}
		mode, parseErr := strconv.Atoi(modeValue)
		if parseErr == nil && (mode == 1 || mode == 3) {
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
