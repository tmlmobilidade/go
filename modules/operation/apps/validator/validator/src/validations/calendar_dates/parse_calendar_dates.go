package calendar_dates

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseCalendarDates(rawCalendarDates types.CalendarDatesRaw, row int) types.CalendarDates {
	var (
		calendarDates   types.CalendarDates = types.CalendarDates{}
		serviceId, date string
		exceptionType   int
		messages        []types.Message
	)

	stringFields := map[string]*string{
		"service_id": &serviceId,
		"date":       &date,
	}

	intFields := map[string]*int{
		"exception_type": &exceptionType,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "calendar_dates.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "calendar_dates_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawCalendarDates, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse int fields
	for field, target := range intFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawCalendarDates, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// If there are any errors, return an empty trip
	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return calendarDates
	}

	// Required fields
	calendarDates.ServiceId = serviceId
	calendarDates.Date = date
	calendarDates.ExceptionType = lib.IfThenElse(lib.GetFieldByTag(&rawCalendarDates, "gtfs", "exception_type") != "", &exceptionType, nil)

	return calendarDates
}
