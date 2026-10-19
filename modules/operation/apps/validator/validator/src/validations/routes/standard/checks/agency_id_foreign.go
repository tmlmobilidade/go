package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func AgencyIdUnique(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_agency_id_unique"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_id", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the agency_id value

	value, err := db.Routes.Field("agency_id")
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