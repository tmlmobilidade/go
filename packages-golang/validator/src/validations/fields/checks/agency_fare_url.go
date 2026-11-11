package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_fare_url
  - Presence: Optional
  - Type: URL

# Description

Web page where riders can purchase the agency's tickets or find information about its fares.

Presence and type follow [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyFareUrlField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "agency", []string{"agency_fare_url"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the agency_fare_url value

		value, err := queries.Field(row.Source, "agency_fare_url")
		if err != nil {
			return err
		}

		//
		// 3. Check if agency_fare_url is required

		if value == "" {
			if context.ShouldSkip(row) {
				return nil
			}

			message := context.GetSeverityMessage(row, "required", "recommended", "informational")
			context.AddMessage(row, message)
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
