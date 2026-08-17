package frequencies

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/frequencies/validations"
	"testing"
)

func testValidParseFrequencies(t *testing.T) {
	services.AppMessageService.Clear()
	frequency := &types.FrequenciesRaw{TripId: "T1", EndTime: "10:00:00", StartTime: "09:00:00", HeadwaySecs: "3600"}
	parsedFrequency := validations.ParseFrequencies(frequency, 1)
	assertion := lib.AssertionMessage{
		Expected: 0,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Valid input should not error",
	}

	endTime := "10:00:00"
	startTime := "09:00:00"

	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
	if parsedFrequency.TripId == nil || *parsedFrequency.TripId != "T1" {
		t.Errorf("Expected TripId 'T1', got '%s'", *parsedFrequency.TripId)
	}
	if *parsedFrequency.EndTime != endTime {
		t.Errorf("Expected EndTime '10:00:00', got '%s'", *parsedFrequency.EndTime)
	}
	if *parsedFrequency.StartTime != startTime {
		t.Errorf("Expected StartTime '09:00:00', got '%s'", *parsedFrequency.StartTime)
	}
}

func testInvalidParseFrequencies(t *testing.T) {
	services.AppMessageService.Clear()
	frequency := &types.FrequenciesRaw{TripId: "T1", EndTime: "10:00:00", StartTime: "09:00:00", HeadwaySecs: "not_a_float"}
	validations.ParseFrequencies(frequency, 1)
	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual:   services.AppMessageService.GetSummary().TotalErrors,
		Message:  "Invalid headway_secs should error",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}
