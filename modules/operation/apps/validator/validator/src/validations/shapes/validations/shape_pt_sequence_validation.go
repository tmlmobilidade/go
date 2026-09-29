package shapes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_pt_sequence
  - Presence: Required
  - Type: Non-negative integer

# Description

Sequence in which the shape points connect to form the shape.

Values must increase along the trip but do not need to be consecutive.

# Example

If the shape "A_shp" has three points in its definition, the [shapes.txt] file might contain these records to define the shape:

	shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence
	A_shp,37.61956,-122.48161,0
	A_shp,37.64430,-122.41070,6
	A_shp,37.65863,-122.30839,11

[shapes.txt]: https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapePtSequenceValidation(shape *types.Shape, row int, rules *types.ShapesRules) {
	ctx := lib.NewValidationContext("shape_pt_sequence", "shapes.txt", "shape_pt_sequence_not_repeated_within_shape", row, services.AppMessageService)
	if rules != nil && rules.ShapePtSequence.Severity != "" {
		ctx.WithSeverity(rules.ShapePtSequence.Severity)
	}

	// 1. Validate shape_pt_sequence is present
	if shape.ShapePtSequence == nil {
		if ctx.ShouldSkip() {
			return
		}

		message := ctx.GetRequiredMessage("shape_pt_sequence_validation.required", "shape_pt_sequence_validation.recommended")
		ctx.AddMessageWithSeverity(message)
		return
	}

	// 2. Validate shape_pt_sequence is forbidden
	if ctx.IsForbidden() {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("shape_pt_sequence_validation.forbidden"))
		return
	}

	// 3. Validate shape_pt_sequence is non-negative
	if *shape.ShapePtSequence < 0 {
		ctx.AddError(ctx.GetTranslatedMessage("shape_pt_sequence_validation.invalid"))
	}
}
