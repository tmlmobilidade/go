package agency_custom

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_name_id_match
  - Presence: required
  - Type: String

# Description

Full name of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyNameIdMatch(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_id_matched_with_agency_name"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_name_id_match", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the agency_id value

	agencyID, err := db.Agency.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 4. Get the agency_name value

	agencyName, err := db.Agency.Field("agency_name")
	if err != nil {
		return err
	}

	//
	// 5. Validate rules

	if rules != nil && rules.Rule(ruleID).Compare != nil {
		//

		//
		// 5.1. Find the matching key and value

		validName := ""
		for _, compare := range *rules.Rule(ruleID).Compare {
			if compare.Key == agencyID && compare.Value == agencyName {
				return nil
			}
			if compare.Key == agencyID {
				validName = compare.Value
			}
		}

		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("no_match", agencyID, agencyName, agencyID, validName))
		return nil
	}

	//
	// 6. Return success

	return nil
}
