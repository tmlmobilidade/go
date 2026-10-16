package agency_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_fare_url
  - Presence: Optional
  - Type: URL

# Description

URL of a web page where a rider can purchase tickets or other fare instruments for that agency, or a web page containing information about that agency's fares.

[agency.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func AgencyFareUrlValid(db *services.SQLiteContext, rules *types.AgencyRules) error {
	//

	//
	// 1. Create the validation context

	ctx := lib.NewValidationContext("agency_fare_url", "agency.txt", "agency_fare_url_valid", db.Row, services.AppMessageService)
	if rules != nil && rules.AgencyFareUrlValid.Severity != "" {
		ctx.WithSeverity(rules.AgencyFareUrlValid.Severity)
	}

	//
	// 2. Get the agency_fare_url value

	value, err := db.Agency.Field("agency_fare_url")
	if err != nil {
		return err
	}

	//
	// 3. Check if agency_fare_url is valid

	if !lib.ValidateUrl(value) {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", value))
		return nil
	}

	//
	// 4. Return success

	return nil
}
