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
  - Field: agency_email
  - Presence: Optional
  - Type: Email

# Description

Email address actively monitored by the agency's customer service department.
This email address should be a direct contact point where transit riders can reach a customer service representative at the agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/

func AgencyEmailValidation(agency *types.Agency, row int, rules *types.AgencyRules) {
	ctx := lib.NewValidationContext("agency_email", "agency.txt", "agency_email_valid_address", row, services.AppMessageService)
	if rules != nil && rules.AgencyEmail.Severity != "" {
		ctx.WithSeverity(rules.AgencyEmail.Severity)
	}

	// Check if agency_email is required
	if agency.AgencyEmail == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("agency_email_validation.required", "agency_email_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_email_validation.forbidden"))
		return
	}

	// Check if agency_email is valid
	if !lib.ValidateEmail(*agency.AgencyEmail) {
		ctx.AddError(ctx.GetTranslatedMessage("agency_email_validation.invalid"))
		return
	}

	// Validate rules
	if rules != nil && rules.AgencyEmail.Options != nil {
		if slices.Contains(*rules.AgencyEmail.Options, types.ALL_OPTIONS) {
			return
		}

		if !slices.Contains(*rules.AgencyEmail.Options, *agency.AgencyEmail) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("agency_email_validation.not_allowed", *agency.AgencyEmail))
			return
		}
	}
}
