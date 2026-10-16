package agency_standard

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
func AgencyTimezoneValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_timezone", "agency.txt", "agency_timezone_valid", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyTimezoneValid.Severity != "" {
		ctx.WithSeverity(rules.AgencyTimezoneValid.Severity)
	}

	//
	// 2. Get the agency_timezone value

	value, err := db.Agency.Field("agency_timezone")
	if err != nil {
		return err
	}

	if value == "" || ctx.ShouldSkip() {
		return nil
	}

	//
	// 3. Check if agency_timezone is valid

	if !lib.ValidateTimezone(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 4. Validate rules

	if rules != nil && rules.AgencyTimezoneValid.Options != nil {
		if slices.Contains(*rules.AgencyTimezoneValid.Options, types.ALL_OPTIONS) {
			return nil
		}

		if !slices.Contains(*rules.AgencyTimezoneValid.Options, value) {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_allowed", value))
			return nil
		}
	}

	//
	// 5. Return success

	return nil
}
