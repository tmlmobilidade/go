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
  - Field: agency_timezone
  - Presence: Required
  - Type: Timezone

# Description

Timezone where the transit agency is located.
If multiple agencies are specified in the dataset, each must have the same 'agency_timezone'.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyTimezoneValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_timezone", "agency.txt", "agency_timezone_valid_id", row, services.AppMessageService)
	if agency.AgencyTimezone == nil {
		ctx.AddError(ctx.GetTranslatedMessage("agency_timezone_validation.required"))
		return
	}

	if !lib.ValidateTimezone(*agency.AgencyTimezone) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_timezone_validation.invalid", *agency.AgencyTimezone))
		return
	}

	// Validate rules
	if rules != nil && rules.AgencyTimezone.Options != nil {
		if slices.Contains(*rules.AgencyTimezone.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyTimezone.Options, *agency.AgencyTimezone) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_timezone_validation.not_allowed", *agency.AgencyTimezone))
			return
		}
	}
}
