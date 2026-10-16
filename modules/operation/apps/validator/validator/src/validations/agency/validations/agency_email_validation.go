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

func AgencyEmailValidation(db *services.SQLiteRow, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_email", "agency.txt", "agency_email_valid_address", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyEmail.Severity != "" {
		ctx.WithSeverity(rules.AgencyEmail.Severity)
	}

	//
	// 1. Get the agency_email value

	value, err := db.Field("agency_email")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_email is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_email is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_email is valid

	if !lib.ValidateEmail(value) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyEmail.Options != nil {
		if slices.Contains(*rules.AgencyEmail.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyEmail.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
