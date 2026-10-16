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
func AgencyTimezoneValidation(db *services.SQLiteRow, rules *types.AgencyRules) error {
	ctx := lib.NewValidationContext("agency_timezone", "agency.txt", "agency_timezone_valid_id", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyTimezone.Severity != "" {
		ctx.WithSeverity(rules.AgencyTimezone.Severity)
	}

	//
	// 1. Get the agency_timezone value

	value, err := db.Field("agency_timezone")
	if err != nil {
		return err
	}

	//
	// 2. Check if agency_timezone is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 3. Check if agency_timezone is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 4. Check if agency_timezone is valid

	if !lib.ValidateTimezone(value) {
		ctx.AddError(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 5. Validate rules

	if rules != nil && rules.AgencyTimezone.Options != nil {
		if slices.Contains(*rules.AgencyTimezone.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyTimezone.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 6. Return success

	return nil
}
