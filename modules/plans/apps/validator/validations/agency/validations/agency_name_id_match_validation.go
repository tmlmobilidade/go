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
  - Presence: Optional
  - Type: String

# Description

Full name of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyNameIdMatchValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_name_id_match", "agency.txt", "agency_id_matched_with_agency_name", row, services.AppMessageService)
	if rules != nil && rules.AgencyNameIdMatch.Severity != types.SEVERITY_IGNORE {
		ctx.WithSeverity(rules.AgencyNameIdMatch.Severity)
	}

	if ctx.ShouldSkip() {
		return
	}

	// Check if agency_id matches agency_name
	if agency.AgencyId == nil || agency.AgencyName == nil {
		message := ctx.GetRequiredMessage("agency_name_id_match_validation.required", "agency_name_id_match_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_name_id_match_validation.forbidden"))
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
