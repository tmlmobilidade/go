package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: network_id
  - Presence: Conditionally Forbidden
  - Type: ID

# Description

Identifies the network containing the route. Several routes can share the same network_id.

Conditionally Forbidden:
- Forbidden if the route_networks.txt or networks.txt file exists.
- Optional otherwise.

Presence and type follow [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func NetworkIdField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"network_id"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the network_id value

		value, err := queries.Field(row.Source, "network_id")
		if err != nil {
			return err
		}

		//
		// 3. Check if the network_id is required

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
