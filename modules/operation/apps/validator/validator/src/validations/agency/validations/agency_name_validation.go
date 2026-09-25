package agency

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
func AgencyNameValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_name", "agency.txt", "agency_name_present", row, services.AppMessageService)
	if rules != nil && rules.AgencyName.Severity != "" {
		ctx.WithSeverity(rules.AgencyName.Severity)
	}

	// Check if agency_name is required
	if agency.AgencyName == nil {
		ctx.AddError(ctx.GetTranslatedMessage("agency_name_validation.required"))
		return 
	}

	// Validate rules
	if rules != nil && rules.AgencyName.Options != nil {
		if slices.Contains(*rules.AgencyName.Options, types.ALL_OPTIONS) {
			return 
		}

		if !slices.Contains(*rules.AgencyName.Options, *agency.AgencyName) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_name_validation.not_allowed", *agency.AgencyName))
			return 
		}
	}

}
