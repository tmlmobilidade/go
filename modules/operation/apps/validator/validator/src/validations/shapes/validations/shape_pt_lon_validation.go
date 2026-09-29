package shapes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_lon
  - Presence: Required
  - Type: Longitude

# Description

Longitude of a shape point.

[shapes.txt]: https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapePtLonValidation(shape *types.Shape, row int, rules *types.ShapesRules) {
	ctx := lib.NewValidationContext("shape_pt_lon", "shapes.txt", "shape_pt_lon_valid_longitude", row, services.AppMessageService)
	if rules != nil && rules.ShapePtLon.Severity != "" {
		ctx.WithSeverity(rules.ShapePtLon.Severity)
	}

	// 1. Validate shape_pt_lon is present
	if shape.ShapePtLon == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shape_pt_lon_validation.required", "shape_pt_lon_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate shape_pt_lon is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_lon_validation.forbidden"))
		return
	}

	// 3. Validate shape_pt_lon is a valid longitude
	if !lib.ValidateLongitude(*shape.ShapePtLon) {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_lon_validation.invalid"))
	}
}
