package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_timezone
  - Presence: Required
  - Type: Timezone

# Description

Timezone used by the agency. All agencies in the same dataset must use the same agency_timezone.

Presence and type follow [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyTimezoneField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "agency", []string{"agency_timezone"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the agency_timezone value

		value, err := queries.Field(row.Source, "agency_timezone")
		if err != nil {
			return err
		}

		//
		// 3. Check if agency_timezone is required

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
