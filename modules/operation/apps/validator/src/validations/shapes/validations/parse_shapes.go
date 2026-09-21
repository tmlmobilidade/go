package shapes

import (
	"main/i18n"
	"main/lib"
	"main/services"
	"main/types"
)

// ParseShape parses a row from shapes.txt into a Shape struct, following gtfs-parser-validation best practices
func ParseShape(rawShape types.ShapeRaw, row int) types.Shape {
	var (
		shape                                     types.Shape = types.Shape{}
		shapeId                                   string
		shapePtSequence                           int
		shapeDistTraveled, shapePtLat, shapePtLon float64
		messages                                  []types.Message
	)

	stringFields := map[string]*string{
		"shape_id": &shapeId,
	}
	float64Fields := map[string]*float64{
		"shape_pt_lat":        &shapePtLat,
		"shape_pt_lon":        &shapePtLon,
		"shape_dist_traveled": &shapeDistTraveled,
	}
	intFields := map[string]*int{
		"shape_pt_sequence": &shapePtSequence,
	}

	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "shapes.txt",
			Rows:     []int{row},
			Message:  i18n.AppTranslator.Get("parse_shapes.parsing_error", msg),
			Severity: types.SEVERITY_ERROR,
			RuleID:   "shapes_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawShape, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}
	// Parse float64 fields
	for field, target := range float64Fields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawShape, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}
	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawShape, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return shape
	}

	// Assign fields
	shape.ShapeId = lib.IfThenElse(shapeId != "", &shapeId, nil)
	shape.ShapePtLat = lib.IfThenElse(rawShape.ShapePtLat != "", &shapePtLat, nil)
	shape.ShapePtLon = lib.IfThenElse(rawShape.ShapePtLon != "", &shapePtLon, nil)
	shape.ShapePtSequence = lib.IfThenElse(rawShape.ShapePtSequence != "", &shapePtSequence, nil)
	shape.ShapeDistTraveled = lib.IfThenElse(rawShape.ShapeDistTraveled != "", &shapeDistTraveled, nil)

	return shape
}
