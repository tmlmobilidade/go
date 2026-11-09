package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: destination_id
  - Presence: Optional
  - Type: Foreign ID referencing stops.zone_id

# Description

Identifies a destination fare zone. Use a separate record for each destination zone associated with the fare.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
*/
func DestinationIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_rules", []string{"destination_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the destination_id value

		value, err := queries.Field(row.Source, "destination_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the destination_id is required

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
