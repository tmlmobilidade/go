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
func ShapePtLatValidation(shape *types.Shape, row int) {
	ctx := lib.NewValidationContext("shape_pt_lat", "shapes.txt", "shape_pt_lat_valid_latitude", row, services.AppMessageService)

	if shape.ShapePtLat == nil {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_lat_validation.required"))
		return
	}

	if !lib.ValidateLatitude(*shape.ShapePtLat) {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_lat_validation.invalid"))
	}
}
