package trips

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: shape_id
  - Presence: Required
  - Type: Foreign Key referencing shapes.shape_id

# Description

Identifies a geospatial shape describing the vehicle travel path for a trip.

[trips.txt]: https://gtfs.org/schedule/reference/#tripstxt
*/
func ShapeIdValidation(trip *types.Trip, row int, gtfs *types.Gtfs, rules *types.TripsRules) {
	ctx := lib.NewValidationContext("shape_id", "trips.txt", "trips_shape_id_references_shapes_table_when_present", row, services.AppMessageService)
	if rules != nil && rules.ShapeId.Severity != "" {
		ctx.WithSeverity(rules.ShapeId.Severity)
	}

	// 1. Validate shape_id is present
	if trip.ShapeId == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shape_id_validation.required", "shape_id_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate shape_id is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_id_validation.forbidden"))
		return
	}

	// 3. Validate shape_id is Foreign Key referencing shapes.shape_id
	if !lib.GtfsIdMapKeyExists(gtfs, "shapes", *trip.ShapeId) {
		ctx.AddError(ctx.GetTranslatedMessage("shape_id_validation.not_found", map[string]any{"shape_id": *trip.ShapeId}))
		return
	}
}
