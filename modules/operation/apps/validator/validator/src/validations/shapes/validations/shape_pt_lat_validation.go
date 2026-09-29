package shapes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_lat
  - Presence: Required
  - Type: Latitude

# Description

Latitude of a shape point. Each record in shapes.txt represents a shape point used to define the shape.

[shapes.txt]: https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapePtLatValidation(shape *types.Shape, row int, rules *types.ShapesRules) {
	ctx := lib.NewValidationContext("shape_pt_lat", "shapes.txt", "shape_pt_lat_valid_latitude", row, services.AppMessageService)
	if rules != nil && rules.ShapePtLat.Severity != "" {
		ctx.WithSeverity(rules.ShapePtLat.Severity)
	}

	// 1. Validate shape_pt_lat is present
	if shape.ShapePtLat == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shape_pt_lat_validation.required", "shape_pt_lat_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate shape_pt_lat is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_lat_validation.forbidden"))
		return
	}

	// 3. Validate shape_pt_lat is a valid latitude
	if !lib.ValidateLatitude(*shape.ShapePtLat) {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_lat_validation.invalid"))
	}
}
