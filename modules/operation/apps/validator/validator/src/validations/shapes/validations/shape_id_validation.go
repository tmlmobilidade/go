package shapes

import (
	"main/lib"
	"main/services"
	"main/types"
)

/*
# Attributes

  - File: [shapes.txt]
  - Field: shape_id
  - Presence: Required
  - Type: ID

# Description

Identifies a shape.

[shapes.txt]: https://gtfs.org/schedule/reference/#shapestxt
*/
func ShapeIdValidation(shape *types.Shape, row int, rules *types.ShapesRules) {
	ctx := lib.NewValidationContext("shape_id", "shapes.txt", "shape_id_required", row, services.AppMessageService)
	if rules != nil && rules.ShapeId.Severity != "" {
		ctx.WithSeverity(rules.ShapeId.Severity)
	}

	// 1. Validate shape_id is present
	if shape.ShapeId == nil || *shape.ShapeId == "" {
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
}
