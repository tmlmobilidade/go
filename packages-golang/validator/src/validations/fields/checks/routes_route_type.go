package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_type
  - Presence: Required
  - Type: Enum

# Description

Mode of transport used by the route. Standard values are 0 tram, 1 metro, 2 rail, 3 bus, 4 ferry, 5 cable tram, 6
aerial lift, 7 funicular, 11 trolleybus and 12 monorail.

Presence and type follow [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RouteTypeField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"route_type"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the route_type value

		value, err := queries.Field(row.Source, "route_type")
		if err != nil {
			return err
		}

		//
		// 3. Check if the route_type is required

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
