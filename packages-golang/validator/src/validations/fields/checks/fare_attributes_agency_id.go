package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [fare_attributes.txt]
  - Field: agency_id
  - Presence: Conditionally Required
  - Type: Foreign ID referencing agency.agency_id

# Description

Identifies the agency responsible for the fare.

Conditionally Required:
- Required if multiple agencies are defined in agency.txt.
- Recommended otherwise.

[fare_attributes.txt]: https://gtfs.org/documentation/schedule/reference/#fare_attributestxt
*/
func FareAttributesAgencyIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_attributes", []string{"agency_id"}, func(row *contextTypes.ValidationContext) error {
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
