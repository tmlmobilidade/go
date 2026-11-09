package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Foreign ID referencing trips.trip_id

# Description

Identifies the trip used as the template for this headway interval.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func FrequenciesTripIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "frequencies", []string{"trip_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the trip_id value

		value, err := queries.Field(row.Source, "trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the trip_id is required

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
