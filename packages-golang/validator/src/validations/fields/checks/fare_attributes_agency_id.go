package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the relevant agency for a fare.

Conditionally Required:
  - Required when the dataset contains data for multiple transit [agencies.txt].
  - Recommended otherwise.

[agencies.txt]: https://gtfs.org/schedule/reference/#agencytxt
*/
func FareAttributesAgencyIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"agency_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the agency_id value

		value, err := queries.Field(row.Source, "agency_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the agency_id is required

		if value == "" {
			if context.ShouldIgnore(row) {
				return nil
			}

			context.AddMessage(row, context.GetSeverityMessage(row, "required", "recommended", "informational"))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
