package agency

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
func AgencyNameIdMatchValidation(db *services.SQLiteRow, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_name_id_match", "agency.txt", "agency_id_matched_with_agency_name", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyNameIdMatch.Severity != "" {
		ctx.WithSeverity(rules.AgencyNameIdMatch.Severity)
	}

	//
	// 1. Get the agency_id and agency_name values

	values, err := db.Fields("agency_id", "agency_name")
	if err != nil {
		return err
	}
	agencyID, agencyName := values["agency_id"], values["agency_name"]

	//
	// 2. Check if agency_id and agency_name are required

	if agencyID == "" || agencyName == "" {
		return nil
	}

	//
	// 3. Check if agency_name_id_match should be skipped

	if ctx.ShouldSkip() {
		return nil
	}

	//
	// 4. Validate rules

	if rules != nil && rules.AgencyNameIdMatch.Compare != nil {
		//

		//
		// 4.1. Find the matching key and value

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
	// 5. Return success

	return nil
}
