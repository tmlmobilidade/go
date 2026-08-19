package calendar

import (
	"main/lib"
	"main/services"
	"main/types"
)

func ParseCalendar(rawCalendar types.CalendarRaw, row int, gtfs *types.Gtfs) types.Calendar {
	var (
		calendar                                                       types.Calendar = types.Calendar{}
		serviceId, startDate, endDate                                  string
		monday, tuesday, wednesday, thursday, friday, saturday, sunday bool
		messages                                                       []types.Message
	)

	stringFields := map[string]*string{
		"service_id": &serviceId,
		"start_date": &startDate,
		"end_date":   &endDate,
	}

	boolFields := map[string]*bool{
		"monday":    &monday,
		"tuesday":   &tuesday,
		"wednesday": &wednesday,
		"thursday":  &thursday,
		"friday":    &friday,
		"saturday":  &saturday,
		"sunday":    &sunday,
	}

	// Helper to collect error messages
	addMessage := func(field, msg string) {
		messages = append(messages, types.Message{
			Field:    field,
			FileName: "calendar.txt",
			Rows:     []int{row},
			Message:  msg,
			Severity: types.SEVERITY_ERROR,
			RuleID:   "calendar_values_parse",
		})
	}

	// Parse string fields
	for field, target := range stringFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawCalendar, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// Parse bool fields
	for field, target := range boolFields {
		if errMsg := lib.ParseStringToPrimitive(lib.GetFieldByTag(&rawCalendar, "gtfs", field), target); errMsg != "" {
			addMessage(field, errMsg)
		}
	}

	// If there are any errors, return an empty trip
	if len(messages) > 0 {
		services.AppMessageService.AddMessages(messages)
		return calendar
	}

	// Required fields
	calendar.ServiceId = serviceId
	calendar.StartDate = startDate
	calendar.EndDate = endDate

	calendar.Monday = monday
	calendar.Tuesday = tuesday
	calendar.Wednesday = wednesday
	calendar.Thursday = thursday
	calendar.Friday = friday
	calendar.Saturday = saturday
	calendar.Sunday = sunday

	return calendar
}
