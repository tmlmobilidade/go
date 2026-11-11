package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: contains_id
  - Presence: Optional
  - Type: Foreign ID referencing stops.zone_id

# Description

Identifies a zone that an itinerary must enter for this fare to apply. When several zones are listed for the fare,
the itinerary must match every listed zone.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
*/
func ContainsIdField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_rules", []string{"contains_id"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the contains_id value

		value, err := queries.Field(row.Source, "contains_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the contains_id is required

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
