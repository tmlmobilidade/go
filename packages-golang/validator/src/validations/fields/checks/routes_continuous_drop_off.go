package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func RoutesContinuousDropOffField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_continuous_drop_off_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("continuous_drop_off", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the continuous_drop_off value

	value, err := db.Routes.Field("continuous_drop_off")
	if err != nil {
		return err
	}

	//
	// 4. Check if the continuous_drop_off is required

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
