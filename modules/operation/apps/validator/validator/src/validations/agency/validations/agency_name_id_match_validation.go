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
func AgencyNameIdMatchValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_name_id_match", "agency.txt", "agency_id_matched_with_agency_name", row, services.AppMessageService)
	if rules != nil && rules.AgencyNameIdMatch.Severity != "" {
		ctx.WithSeverity(rules.AgencyNameIdMatch.Severity)
	}

	// agency_id and agency_name are required
	if agency.AgencyId == nil || agency.AgencyName == nil {
		return 
	}

	// Check if agency_name_id_match should be skipped
	if ctx.ShouldSkip() {
		return 
	}

	// Validate rules
	if rules != nil && rules.AgencyNameIdMatch.Compare != nil {
		// Find the matching key and value
		validName := ""
		for _, compare := range *rules.AgencyNameIdMatch.Compare {
			if compare.Key == *agency.AgencyId && compare.Value == *agency.AgencyName {
				return 
			}
			if compare.Key == *agency.AgencyId {
				validName = compare.Value
			}
		}

		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_name_id_match_validation.no_match", *agency.AgencyId, *agency.AgencyName, *agency.AgencyId, validName))
		return 
	}
}
