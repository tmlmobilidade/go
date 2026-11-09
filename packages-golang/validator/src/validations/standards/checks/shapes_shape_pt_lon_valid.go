package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	validators "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/validators"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_lon
  - Presence: Required
  - Type: Longitude

# Description

WGS84 longitude in decimal degrees of this point on the shape.

Validation: Checks that the text is numeric and within the inclusive longitude range from -180 to 180 degrees.
Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#shapestxt
*/
func ShapePtLonValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "shapes", []string{"shape_pt_lon"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "shape_pt_lon")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Transform the value to a float

		number, parseErr := strconv.ParseFloat(value, 64)
		if parseErr != nil {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Check if the shape_pt_lon is valid

		if !validators.ValidateLongitude(number) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
