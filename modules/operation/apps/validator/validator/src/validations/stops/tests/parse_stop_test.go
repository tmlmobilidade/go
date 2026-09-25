package stops

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/stops/validations"
	"testing"
)

func TestParseStop_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	row := 1
	raw := types.StopRaw{
		StopId:                "S1",
		StopCode:              "C1",
		StopName:              "Main St",
		StopDesc:              "Main Street Stop",
		ZoneId:                "Z1",
		StopUrl:               "http://example.com",
		ParentStation:         "P1",
		StopTimezone:          "Europe/Lisbon",
		LevelId:               "L1",
		PlatformCode:          "PL1",
		LocationType:          "1",
		WheelchairBoarding:    "2",
		StopLat:               "40.1234",
		StopLon:               "-8.5678",
		TtsStopName:           "Main St",
		HasTariffsInformation: "1",
		HasShelter:            "1",
		HasStopSign:           "1",
		HasNetworkMap:         "1",
		HasPipRealTime:        "1",
		HasSchedules:          "1",
		HasBench:              "1",
		PublicVisible:         "1",
	}

	stop := validations.ParseStop(raw, row)

	if stop.StopId == nil || *stop.StopId != "S1" {
		t.Errorf("Expected StopId 'S1', got '%v'", *stop.StopId)
	}
	if stop.StopCode == nil || *stop.StopCode != "C1" {
		t.Errorf("Expected StopCode 'C1', got '%v'", *stop.StopCode)
	}
	if stop.StopName == nil || *stop.StopName != "Main St" {
		t.Errorf("Expected StopName 'Main St', got '%v'", *stop.StopName)
	}
	if stop.StopDesc == nil || *stop.StopDesc != "Main Street Stop" {
		t.Errorf("Expected StopDesc 'Main Street Stop', got '%v'", *stop.StopDesc)
	}
	if stop.ZoneId == nil || *stop.ZoneId != "Z1" {
		t.Errorf("Expected ZoneId 'Z1', got '%v'", *stop.ZoneId)
	}
	if stop.StopUrl == nil || *stop.StopUrl != "http://example.com" {
		t.Errorf("Expected StopUrl 'http://example.com', got '%v'", *stop.StopUrl)
	}
	if stop.ParentStation == nil || *stop.ParentStation != "P1" {
		t.Errorf("Expected ParentStation 'P1', got '%v'", *stop.ParentStation)
	}
	if stop.StopTimezone == nil || *stop.StopTimezone != "Europe/Lisbon" {
		t.Errorf("Expected StopTimezone 'Europe/Lisbon', got '%v'", *stop.StopTimezone)
	}
	if stop.LevelId == nil || *stop.LevelId != "L1" {
		t.Errorf("Expected LevelId 'L1', got '%v'", *stop.LevelId)
	}
	if stop.PlatformCode == nil || *stop.PlatformCode != "PL1" {
		t.Errorf("Expected PlatformCode 'PL1', got '%v'", *stop.PlatformCode)
	}
	if stop.LocationType == nil || *stop.LocationType != 1 {
		t.Errorf("Expected LocationType '1', got '%v'", *stop.LocationType)
	}
	if stop.WheelchairBoarding == nil || *stop.WheelchairBoarding != 2 {
		t.Errorf("Expected WheelchairBoarding '2', got '%v'", *stop.WheelchairBoarding)
	}
	if stop.StopLat == nil || *stop.StopLat != 40.1234 {
		t.Errorf("Expected StopLat '40.1234', got '%v'", *stop.StopLat)
	}
	if stop.StopLon == nil || *stop.StopLon != -8.5678 {
		t.Errorf("Expected StopLon '-8.5678', got '%v'", *stop.StopLon)
	}
	if stop.TtsStopName == nil || *stop.TtsStopName != "Main St" {
		t.Errorf("Expected TtsStopName 'Main St', got '%v'", *stop.TtsStopName)
	}

	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid stop should not error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}

func TestParseStop_InvalidIntFields(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	raw := types.StopRaw{
		StopId:             "S2",
		LocationType:       "INVALID",
		WheelchairBoarding: "INVALID",
	}

	validations.ParseStop(raw, row)

	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid int fields should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}

func TestParseStop_InvalidFloatFields(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	raw := types.StopRaw{
		StopId:  "S2",
		StopLat: "INVALID",
		StopLon: "INVALID",
	}

	validations.ParseStop(raw, row)
	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid float fields should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}

func TestParseStop_InvalidBoolFields(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	raw := types.StopRaw{
		StopId:                "S2",
		HasTariffsInformation: "INVALID",
		HasShelter:            "INVALID",
		HasStopSign:           "INVALID",
		HasNetworkMap:         "INVALID",
		HasPipRealTime:        "INVALID",
		HasSchedules:          "INVALID",
		HasBench:              "INVALID",
		PublicVisible:         "INVALID",
	}

	validations.ParseStop(raw, row)
	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid bool fields should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}
