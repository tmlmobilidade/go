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
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_name_id_match", "agency.txt", "agency_id_matched_with_agency_name", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyNameIdMatch.Severity != "" {
		ctx.WithSeverity(rules.AgencyNameIdMatch.Severity)
	}

	//
	// 2. Get the agency_id value

	agencyID, err := db.Agency.Field("agency_id")
	if err != nil {
		return err
	}

	//
	// 3. Get the agency_name value

	agencyName, err := db.Agency.Field("agency_name")
	if err != nil {
		return err
	}

	//
	// 4. Check if agency_name_id_match should be skipped

	if agencyID == "" || agencyName == "" || ctx.ShouldSkip() {
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyNameIdMatch.Compare != nil {
		//

		//
		// 5.1. Find the matching key and value

		validName := ""
		for _, compare := range *rules.AgencyNameIdMatch.Compare {
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
