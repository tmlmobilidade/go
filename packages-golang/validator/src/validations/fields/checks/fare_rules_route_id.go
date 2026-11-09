package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [fare_rules.txt]
  - Field: route_id
  - Presence: Optional
  - Type: Foreign ID referencing routes.route_id

# Description

Identifies a route to which the fare applies. Use a separate record for each route sharing the same fare.

[fare_rules.txt]: https://gtfs.org/documentation/schedule/reference/#fare_rulestxt
*/
func FareRulesRouteIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "fare_rules", []string{"route_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the route_id value

		value, err := queries.Field(row.Source, "route_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the route_id is required

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
