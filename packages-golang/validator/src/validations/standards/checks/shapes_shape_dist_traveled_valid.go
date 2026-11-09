package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"math"
	"strconv"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_dist_traveled
  - Presence: Optional
  - Type: Non-negative float

# Description

Distance traveled from the first point of the shape to this point. It must increase with shape_pt_sequence and use
the same units as stop_times.shape_dist_traveled.

Validation: Checks that the populated value is a finite number greater than or equal to zero. Empty values are
skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[shapes.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/shapes
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#shapestxt
*/
func ShapesShapeDistTraveledValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "shapes", []string{"shape_dist_traveled"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "shape_dist_traveled")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Check if the shape_dist_traveled is valid

		number, parseErr := strconv.ParseFloat(value, 64)
		if parseErr != nil || number < 0 || math.IsNaN(number) || math.IsInf(number, 0) {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
			return nil
		}

		//
		// 3. Return success

		return nil
	})
}
