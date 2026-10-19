package agency_fields

import (
	"main/lib"
	"main/services"
	"main/types"
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
func AgencyTimezoneField(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_timezone", "agency.txt", "agency_timezone_field", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("agency_timezone_field")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the agency_timezone value

	value, err := db.Agency.Field("agency_timezone")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_timezone is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetSeverityMessage("required", "recommended", "informational")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 4. Return success

	return nil
}
