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
func ShapePtLonValidation(shape *types.Shape, row int) {
	ctx := lib.NewValidationContext("shape_pt_lon", "shapes.txt", "shape_pt_lon_valid_longitude", row, services.AppMessageService)

	if shape.ShapePtLon == nil {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_lon_validation.required"))
		return
	}

	if !lib.ValidateLongitude(*shape.ShapePtLon) {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_lon_validation.invalid"))
	}
}
