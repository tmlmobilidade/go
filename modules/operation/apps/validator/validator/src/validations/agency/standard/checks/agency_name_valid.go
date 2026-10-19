package agency_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"slices"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_name
  - Presence: Required
  - Type: String

# Description

Full name of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyNameValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_name_valid"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_name", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the agency_name value

	value, err := db.Agency.Field("agency_name")
	if err != nil {
		return err
	}

	//
	// 4. Validate rules

	if rules != nil && rules.Rule(ruleID).Options != nil {
		if slices.Contains(*rules.Rule(ruleID).Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.Rule(ruleID).Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}
