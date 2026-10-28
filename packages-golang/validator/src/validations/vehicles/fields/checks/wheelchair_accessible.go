package vehicles_fields_checks

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func WheelchairAccessibleField(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_wheelchair_accessible_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("wheelchair_accessible", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the wheelchair_accessible value

	value, err := db.Vehicles.Field("wheelchair_accessible")
	if err != nil {
		return err
	}

	//
	// 4. Check if the wheelchair_accessible is required

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
