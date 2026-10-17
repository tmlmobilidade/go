package agency_fields

import (
	"main/lib"
	"main/services"
	"main/types"
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
func AgencyNameField(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_name", "agency.txt", "agency_name_field", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyNameField.Severity != "" {
		ctx.WithSeverity(rules.AgencyNameField.Severity)
	}

	//
	// 2. Get the agency_name value

	value, err := db.Agency.Field("agency_name")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_name is required

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
