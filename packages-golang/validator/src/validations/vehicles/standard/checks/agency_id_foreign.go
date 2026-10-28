package vehicles_standard

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	"main/types"
)

func AgencyIdForeign(db *services.SQLiteContext, rules *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "vehicles_agency_id_foreign"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "vehicles.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}

	//
	// 3. Get the agency_id value

	value, err := db.Vehicles.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 4. Check if the agency_id is foreign

	if !db.Agency.Exists("agency_id", value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
		return nil
	}

	//
	// 5. Return success

	return nil
}
