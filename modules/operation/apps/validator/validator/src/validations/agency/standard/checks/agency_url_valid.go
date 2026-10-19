package agency_standard

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
func AgencyUrlValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_url", "agency.txt", "agency_url_valid", db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule("agency_url_valid")
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 2. Get the agency_url value

	value, err := db.Agency.Field("agency_url")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 4. Return success

	return nil
}
