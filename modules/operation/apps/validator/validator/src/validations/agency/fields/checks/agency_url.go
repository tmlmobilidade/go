package agency_fields

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_url
  - Presence: Optional
  - Type: URL

# Description

URL of the transit agency.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyUrlField(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_url", "agency.txt", "agency_url_field", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyUrlField.Severity != "" {
		ctx.WithSeverity(rules.AgencyUrlField.Severity)
	}

	//
	// 2. Get the agency_url value

	value, err := db.Agency.Field("agency_url")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_url is required

	if value == "" {
		if ctx.ShouldSkip() {
			return nil
		}

		message := ctx.GetRequiredMessage("required", "recommended")
		ctx.AddMessageWithSeverity(message)
		return nil
	}

	//
	// 4. Check if agency_url is forbidden

	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden"))
		return nil
	}

	//
	// 5. Return success

	return nil
}
