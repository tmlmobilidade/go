package calendar

import (
	"main/lib"
	"main/services"
	"main/types"
	validations "main/validations/calendar"
	"testing"
)

func TestParseCalendar_ValidInput(t *testing.T) {
	services.AppMessageService.Clear()
	row := 1
	raw := types.CalendarRaw{
		ServiceId: "S1",
		StartDate: "20240101",
		EndDate:   "20241231",
		Monday:     "1",
		Tuesday:    "1",
		Wednesday:  "1",
		Thursday:   "1",
		Friday:     "1",
		Saturday:   "0",
		Sunday:     "0",
	}
	gtfs := &types.Gtfs{}
	calendar := validations.ParseCalendar(raw, row, gtfs)

	if calendar.ServiceId != "S1" {
		t.Errorf("Expected ServiceId 'S1', got '%s'", calendar.ServiceId)
	}
	if calendar.StartDate != "20240101" {
		t.Errorf("Expected StartDate '20240101', got '%s'", calendar.StartDate)
	}
	if calendar.EndDate != "20241231" {
		t.Errorf("Expected EndDate '20241231', got '%s'", calendar.EndDate)
	}
	if !calendar.Monday {
		t.Error("Expected Monday to be true")
	}
	if !calendar.Tuesday {
		t.Error("Expected Tuesday to be true")
	}
	if !calendar.Wednesday {
		t.Error("Expected Wednesday to be true")
	}
	if !calendar.Thursday {
		t.Error("Expected Thursday to be true")
	}
	if !calendar.Friday {
		t.Error("Expected Friday to be true")
	}
	if calendar.Saturday {
		t.Error("Expected Saturday to be false")
	}
	if calendar.Sunday {
		t.Error("Expected Sunday to be false")
	}
}

func TestParseCalendar_InvalidBooleanValues(t *testing.T) {
	services.AppMessageService.Clear()
	row := 3
	raw := types.CalendarRaw{
		ServiceId: "S1",
		StartDate: "20240101",
		EndDate:   "20241231",
		Monday:     "2", // Invalid boolean value
		Tuesday:    "1",
		Wednesday:  "1",
		Thursday:   "2", // Invalid boolean value
		Friday:     "1",
		Saturday:   "0",
		Sunday:     "0",
	}
	gtfs := &types.Gtfs{}
	validations.ParseCalendar(raw, row, gtfs)

	assertion := lib.AssertionMessage{
		Expected: 1,
		Actual: services.AppMessageService.GetSummary().TotalErrors,
		Message: "Invalid boolean value (should error)",
	}
	if assert := lib.Assert(assertion); assert != "" {
		t.Error(assert)
	}
}

func TestParseCalendar_AllDaysDisabled(t *testing.T) {
	services.AppMessageService.Clear()
	row := 4
	raw := types.CalendarRaw{
		ServiceId: "S1",
		StartDate: "20240101",
		EndDate:   "20241231",
		Monday:     "0",
		Tuesday:    "0",
		Wednesday:  "0",
		Thursday:   "0",
		Friday:     "0",
		Saturday:   "0",
		Sunday:     "0",
	}
	gtfs := &types.Gtfs{}
	calendar := validations.ParseCalendar(raw, row, gtfs)

	if calendar.Monday || calendar.Tuesday || calendar.Wednesday || calendar.Thursday || 
	   calendar.Friday || calendar.Saturday || calendar.Sunday {
		t.Error("Expected all days to be false")
	}
}

func TestParseCalendar_AllDaysEnabled(t *testing.T) {
	services.AppMessageService.Clear()
	row := 5
	raw := types.CalendarRaw{
		ServiceId: "S1",
		StartDate: "20240101",
		EndDate:   "20241231",
		Monday:     "1",
		Tuesday:    "1",
		Wednesday:  "1",
		Thursday:   "1",
		Friday:     "1",
		Saturday:   "1",
		Sunday:     "1",
	}
	gtfs := &types.Gtfs{}
	calendar := validations.ParseCalendar(raw, row, gtfs)

	if !calendar.Monday || !calendar.Tuesday || !calendar.Wednesday || !calendar.Thursday || 
	   !calendar.Friday || !calendar.Saturday || !calendar.Sunday {
		t.Error("Expected all days to be true")
	}
}
