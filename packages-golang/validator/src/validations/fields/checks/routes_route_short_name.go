package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_short_name
  - Presence: Conditionally Required
  - Type: Text

# Description

Short public-facing route designation, such as a route number or color name. It can be provided together with
route_long_name and should be no longer than 12 characters.

Conditionally Required:
  - Required if `routes.route_long_name` is empty.
  - Recommended if there is a brief service designation. This should be the commonly-known passenger name of the
    service, and should be no longer than 12 characters.

Presence and type follow [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RouteShortNameField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"route_short_name"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the route_short_name value

		value, err := queries.Field(row.Source, "route_short_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the route_short_name is required

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
