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
  - Field: agency_phone
  - Presence: Optional
  - Type: Phone Number

# Description

A voice telephone number for the specified agency.
This field is a string value that presents the telephone number as typical for the agency's service area.
It may contain punctuation marks to group the digits of the number.
Dialable text (for example, TriMet's "503-238-RIDE") is permitted, but the field must not contain any other descriptive text.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyPhoneValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_phone", "agency.txt", "agency_phone_valid_phone_number", row, services.AppMessageService)
	if rules != nil && rules.AgencyPhone.Severity != "" {
		ctx.WithSeverity(rules.AgencyPhone.Severity)
	}

	// Check if agency_phone is required
	if agency.AgencyPhone == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("agency_phone_validation.required", "agency_phone_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_phone_validation.forbidden"))
		return
	}

	if !lib.ValidatePhone(*agency.AgencyPhone) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_phone_validation.invalid", *agency.AgencyPhone))
		return
	}

	// Validate rules
	if rules != nil && rules.AgencyPhone.Options != nil {
		if slices.Contains(*rules.AgencyPhone.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyPhone.Options, *agency.AgencyPhone) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_phone_validation.not_allowed", *agency.AgencyPhone))
			return
		}
	}
}
