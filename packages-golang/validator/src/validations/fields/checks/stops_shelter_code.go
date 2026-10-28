package fields

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func ShelterCodeField(db *services.SQLiteContext, rulesContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "stops_shelter_code_field"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("shelter_code", "stops.txt", ruleID, db.Row, services.AppMessageService)
	if rulesContext != nil {
		ctx.WithSeverity(rulesContext.Severity)
	}

	//
	// 3. Get the shelter_code value

	value, err := db.Stops.Field("shelter_code")
	if err != nil {
		return err
	}

	//
	// 4. Check if the shelter_code is present

	if value == "" {
		if ctx.ShouldIgnore() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 5. Return success

	return nil
}
