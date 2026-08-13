package shapes

import (
	"main/services"
	"main/types"
	validations "main/validations/shapes/validations"
	"testing"
)

func TestParseShape_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	row := 1
	raw := types.ShapeRaw{
		ShapeId:           "SHP1",
		ShapePtLat:        "37.61956",
		ShapePtLon:        "-122.48161",
		ShapePtSequence:   "0",
		ShapeDistTraveled: "0.0",
	}
	shape := validations.ParseShape(raw, row)

	if shape.ShapeId == nil || *shape.ShapeId != "SHP1" {
		t.Errorf("Expected ShapeId 'SHP1', got '%v'", shape.ShapeId)
	}
	if shape.ShapePtLat == nil || *shape.ShapePtLat != float32(37.61956) {
		t.Errorf("Expected ShapePtLat 37.61956, got '%v'", shape.ShapePtLat)
	}
	if shape.ShapePtLon == nil || *shape.ShapePtLon != float32(-122.48161) {
		t.Errorf("Expected ShapePtLon -122.48161, got '%v'", shape.ShapePtLon)
	}
	if shape.ShapePtSequence == nil || *shape.ShapePtSequence != 0 {
		t.Errorf("Expected ShapePtSequence 0, got '%v'", shape.ShapePtSequence)
	}
	if shape.ShapeDistTraveled == nil || *shape.ShapeDistTraveled != 0.0 {
		t.Errorf("Expected ShapeDistTraveled 0.0, got '%v'", shape.ShapeDistTraveled)
	}
}

func TestParseShape_InvalidFloatField(t *testing.T) {
	services.AppMessageService.Clear()
	row := 2
	raw := types.ShapeRaw{
		ShapeId:           "SHP2",
		ShapePtLat:        "not_a_float",
		ShapePtLon:        "-122.48161",
		ShapePtSequence:   "1",
		ShapeDistTraveled: "1.5",
	}
	shape := validations.ParseShape(raw, row)

	if shape != (types.Shape{}) {
		t.Errorf("Expected empty Shape struct when float field is invalid, got '%+v'", shape)
	}
	if services.AppMessageService.GetSummary().TotalErrors != 1 {
		t.Errorf("Expected 1 error message, got %d", services.AppMessageService.GetSummary().TotalErrors)
	}
}

func TestParseShape_InvalidIntField(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	raw := types.ShapeRaw{
		ShapeId:           "SHP3",
		ShapePtLat:        "37.61956",
		ShapePtLon:        "-122.48161",
		ShapePtSequence:   "not_an_int",
		ShapeDistTraveled: "2.5",
	}
	shape := validations.ParseShape(raw, row)

	if shape != (types.Shape{}) {
		t.Errorf("Expected empty Shape struct when int field is invalid, got '%+v'", shape)
	}
	if services.AppMessageService.GetSummary().TotalErrors != 1 {
		t.Errorf("Expected 1 error message, got %d", services.AppMessageService.GetSummary().TotalErrors)
	}
}

func TestParseShape_OptionalFieldsEmpty(t *testing.T) {
	services.AppMessageService.Clear()
	row := 4
	raw := types.ShapeRaw{
		ShapeId:           "SHP4",
		ShapePtLat:        "37.61956",
		ShapePtLon:        "-122.48161",
		ShapePtSequence:   "2",
		ShapeDistTraveled: "",
	}
	shape := validations.ParseShape(raw, row)

	if shape.ShapeId == nil || *shape.ShapeId != "SHP4" {
		t.Errorf("Expected ShapeId 'SHP4', got '%v'", shape.ShapeId)
	}
	if shape.ShapePtLat == nil || *shape.ShapePtLat != float32(37.61956) {
		t.Errorf("Expected ShapePtLat 37.61956, got '%v'", shape.ShapePtLat)
	}
	if shape.ShapePtLon == nil || *shape.ShapePtLon != float32(-122.48161) {
		t.Errorf("Expected ShapePtLon -122.48161, got '%v'", shape.ShapePtLon)
	}
	if shape.ShapePtSequence == nil || *shape.ShapePtSequence != 2 {
		t.Errorf("Expected ShapePtSequence 2, got '%v'", shape.ShapePtSequence)
	}
	if shape.ShapeDistTraveled != nil {
		t.Errorf("Expected ShapeDistTraveled nil, got '%v'", shape.ShapeDistTraveled)
	}
}
