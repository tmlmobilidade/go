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
  - Presence: optional
  - Type: Timezone

# Description

Timezone where the transit agency is located.
If multiple agencies are specified in the dataset, each must have the same 'agency_timezone'.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyTimezoneValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_timezone", "agency.txt", "agency_timezone_valid_id", row, services.AppMessageService)
	if rules != nil && rules.AgencyTimezone.Severity != "" {
		ctx.WithSeverity(rules.AgencyTimezone.Severity)
	}

	// Check if agency_timezone is required
	if agency.AgencyTimezone == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("agency_timezone_validation.required", "agency_timezone_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return 
	}

	// Check if agency_timezone is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_timezone_validation.forbidden"))
		return 
	}

	// Check if agency_timezone is valid
	if !lib.ValidateTimezone(*agency.AgencyTimezone) {
		ctx.AddError(ctx.GetTranslatedMessage("agency_timezone_validation.invalid", *agency.AgencyTimezone))
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
