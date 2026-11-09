package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [agency.txt]
  - Field: agency_phone
  - Presence: Optional
  - Type: Phone number

# Description

Customer service telephone number presented in the agency's usual local format. Dialable letters are allowed, but
unrelated descriptive text should not be included.

Presence and type follow [GTFS Standard].

[agency.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/agency
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#agencytxt
*/
func AgencyPhoneField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "agency", []string{"agency_phone"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the agency_phone value

		value, err := queries.Field(row.Source, "agency_phone")
		if err != nil {
			return err
		}

		//
		// 3. Check if agency_phone is required

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
