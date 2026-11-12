package fields

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_lat
  - Presence: Required
  - Type: Latitude

# Description

WGS84 latitude in decimal degrees of this point on the shape.

Presence and type follow [GTFS Standard].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#shapestxt
*/
func ShapePtLatField(ctx *contextTypes.ValidationContext) error {
	//

	//
	// 1. Select the source table and fields for this rule

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_lat"}, func(row *contextTypes.ValidationContext) error {
		//
		// 2. Get the shape_pt_lat value

		value, err := queries.Field(row.Source, "shape_pt_lat")
		if err != nil {
			return err
		}

		//
		// 3. Check if the shape_pt_lat is required

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
