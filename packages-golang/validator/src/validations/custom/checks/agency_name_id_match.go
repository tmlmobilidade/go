package custom

import (
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
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
func AgencyNameIdMatch(db *services.SQLiteContext, ruleContext *types.RuleContext) error {
	//

	//
	// 1. Get the rule

	const ruleID = "agency_id_matched_with_agency_name"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("agency_name_id_match", "agency.txt", ruleID, db.Row, services.AppMessageService)
	if ruleContext != nil {
		ctx.WithSeverity(ruleContext.Severity)
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

	if ruleContext != nil && ruleContext.Compare != nil {
		//

		//
		// 5.1. Find the matching key and value

		validName := ""
		for _, compare := range *ruleContext.Compare {
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
