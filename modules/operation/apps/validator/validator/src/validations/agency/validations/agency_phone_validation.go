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
func AgencyPhoneValidation(db *services.SQLiteContext, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_phone", "agency.txt", "agency_phone_valid_phone_number", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyPhone.Severity != "" {
		ctx.WithSeverity(rules.AgencyPhone.Severity)
	}

	//
	// 1. Get the agency_phone value

	value, err := db.Agency.Field("agency_phone")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_phone is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_phone is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_phone is valid

	if !lib.ValidatePhone(value) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyPhone.Options != nil {
		if slices.Contains(*rules.AgencyPhone.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyPhone.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
