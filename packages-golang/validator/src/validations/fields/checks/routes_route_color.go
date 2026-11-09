package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [routes.txt]
  - Field: route_color
  - Presence: Optional
  - Type: Color

# Description

Six-digit hexadecimal route color without a leading hash, matching public information. Defaults to white when
absent and must contrast sufficiently with route_text_color.

Presence and type follow [GTFS Standard].

[routes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/routes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#routestxt
*/
func RouteColorField(ctx *context.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "routes", []string{"route_color"}, func(row *context.ValidationContext) error {
		//
		// 2. Get the route_color value

		value, err := queries.Field(row.Source, "route_color")
		if err != nil {
			return err
		}

		//
		// 3. Check if the route_color is required

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
