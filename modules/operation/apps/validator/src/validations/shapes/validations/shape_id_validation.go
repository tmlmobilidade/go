package shapes

import (
	"main/i18n"
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
func ShapeIdValidation(shape *types.Shape, row int) {
	if shape.ShapeId == nil || *shape.ShapeId == "" {
		message := types.Message{
			Field:        "shape_id",
			FileName:     "shapes.txt",
			Rows:         []int{row},
			Message:      i18n.AppTranslator.Get("shape_id_validation.required"),
			Severity:     types.SEVERITY_ERROR,
			RuleID:       "shape_id_required",
		}
		services.AppMessageService.AddMessage(message)
	}
}
