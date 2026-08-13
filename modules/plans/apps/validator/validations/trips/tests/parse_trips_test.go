package trips

import (
	"main/services"
	"main/types"
	validations "main/validations/trips/validations"
	"testing"
)

func TestParseTrips_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	row := 1
	raw := types.TripRaw{
		TripId:               "T1",
		RouteId:              "R1",
		ServiceId:            "S1",
		TripHeadsign:         "Headsign",
		TripShortName:       "Short",
		DirectionId:          "1",
		BlockId:              "B1",
		ShapeId:              "SH1",
		WheelchairAccessible: "2",
		BikesAllowed:         "1",
	}
	trip := validations.ParseTrips(raw, row)

	if *trip.TripId != "T1" {
		t.Errorf("Expected TripId 'T1', got '%s'", *trip.TripId)
	}
	if *trip.RouteId != "R1" {
		t.Errorf("Expected RouteId 'R1', got '%s'", *trip.RouteId)
	}
	if *trip.ServiceId != "S1" {
		t.Errorf("Expected ServiceId 'S1', got '%s'", *trip.ServiceId)
	}
	if trip.TripHeadsign == nil || *trip.TripHeadsign != "Headsign" {
		t.Errorf("Expected TripHeadsign 'Headsign', got '%v'", trip.TripHeadsign)
	}
	if trip.TripShortName == nil || *trip.TripShortName != "Short" {
		t.Errorf("Expected TripShortName 'Short', got '%v'", trip.TripShortName)
	}
	if trip.BlockId == nil || *trip.BlockId != "B1" {
		t.Errorf("Expected BlockId 'B1', got '%v'", trip.BlockId)
	}
	if trip.ShapeId == nil || *trip.ShapeId != "SH1" {
		t.Errorf("Expected ShapeId 'SH1', got '%v'", trip.ShapeId)
	}
	if trip.DirectionId == nil || *trip.DirectionId != 1 {
		t.Errorf("Expected DirectionId 1, got '%v'", trip.DirectionId)
	}
	if trip.WheelchairAccessible == nil || *trip.WheelchairAccessible != 2 {
		t.Errorf("Expected WheelchairAccessible 2, got '%v'", trip.WheelchairAccessible)
	}
	if trip.BikesAllowed == nil || *trip.BikesAllowed != 1 {
		t.Errorf("Expected BikesAllowed 1, got '%v'", trip.BikesAllowed)
	}
}

func TestParseTrips_ValidIntField(t *testing.T) {
	services.AppMessageService.Clear()
	row := 2
	raw := types.TripRaw{
		TripId:               "T1",
		RouteId:              "R1",
		ServiceId:            "S1",
		TripHeadsign:         "Headsign",
		TripShortName:       "Short",
		DirectionId:          "1",
		BlockId:              "B1",
		ShapeId:              "SH1",
		WheelchairAccessible: "2",
		BikesAllowed:         "1",
	}
	trip := validations.ParseTrips(raw, row)

	if trip.DirectionId == nil || *trip.DirectionId != 1 {
		t.Errorf("Expected DirectionId 1, got '%v'", trip.DirectionId)
	}
	
	if trip.WheelchairAccessible == nil || *trip.WheelchairAccessible != 2 {
		t.Errorf("Expected WheelchairAccessible 2, got '%v'", trip.WheelchairAccessible)
	}

	if trip.BikesAllowed == nil || *trip.BikesAllowed != 1 {
		t.Errorf("Expected BikesAllowed 1, got '%v'", trip.BikesAllowed)
	}
}

func TestParseTrips_InvalidIntField(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	raw := types.TripRaw{
		TripId:               "T1",
		RouteId:              "R1",
		ServiceId:            "S1",
		TripHeadsign:         "Headsign",
		TripShortName:       "Short",
		DirectionId:          "not_an_int",
		BlockId:              "B1",
		ShapeId:              "SH1",
		WheelchairAccessible: "2",
		BikesAllowed:         "1",
	}
	trip := validations.ParseTrips(raw, row)

	if trip != (types.Trip{}) {
		t.Errorf("Expected empty Trip struct when int field is invalid, got '%+v'", trip)
	}
	if services.AppMessageService.GetSummary().TotalErrors != 1 {
		t.Errorf("Expected 1 error message, got %d", services.AppMessageService.GetSummary().TotalErrors)
	}
}

func TestParseTrips_OptionalFieldsEmpty(t *testing.T) {
	services.AppMessageService.Clear()
	row := 4
	raw := types.TripRaw{
		TripId:               "T2",
		RouteId:              "R2",
		ServiceId:            "S2",
		TripHeadsign:         "",
		TripShortName:       "",
		DirectionId:          "",
		BlockId:              "",
		ShapeId:              "",
		WheelchairAccessible: "",
		BikesAllowed:         "",
	}
	trip := validations.ParseTrips(raw, row)

	if *trip.TripId != "T2" {
		t.Errorf("Expected TripId 'T2', got '%s'", *trip.TripId)
	}
	if *trip.RouteId != "R2" {
		t.Errorf("Expected RouteId 'R2', got '%s'", *trip.RouteId)
	}
	if *trip.ServiceId != "S2" {
		t.Errorf("Expected ServiceId 'S2', got '%s'", *trip.ServiceId)
	}
	if trip.TripHeadsign != nil {
		t.Errorf("Expected TripHeadsign nil, got '%v'", trip.TripHeadsign)
	}
	if trip.TripShortName != nil {
		t.Errorf("Expected TripShortName nil, got '%v'", trip.TripShortName)
	}
	if trip.BlockId != nil {
		t.Errorf("Expected BlockId nil, got '%v'", trip.BlockId)
	}
	if trip.ShapeId != nil {
		t.Errorf("Expected ShapeId nil, got '%v'", trip.ShapeId)
	}
	if trip.DirectionId != nil {
		t.Errorf("Expected DirectionId nil, got '%v'", trip.DirectionId)
	}
	if trip.WheelchairAccessible != nil {
		t.Errorf("Expected WheelchairAccessible nil, got '%v'", trip.WheelchairAccessible)
	}
	if trip.BikesAllowed != nil {
		t.Errorf("Expected BikesAllowed nil, got '%v'", trip.BikesAllowed)
	}
}
