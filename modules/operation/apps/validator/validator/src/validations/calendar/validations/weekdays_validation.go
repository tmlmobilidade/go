package calendar

import (
	"main/lib"
	"main/services"
)

// WeekdaysValidation preserves the calendar_values_parse checks without building
// a typed calendar. Invalid weekday values prevent further checks on that row.
func WeekdaysValidation(db *services.SQLiteContext) (bool, error) {
	const ruleID = "calendar_values_parse"

	fields := []string{"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
	values, err := db.Calendar.Fields(fields...)
	if err != nil {
		return false, err
	}

	valid := true
	for _, field := range fields {
		var value bool
		if message := lib.ParseStringToPrimitive(values[field], &value); message != "" {
			ctx := lib.NewValidationContext(field, "calendar.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(message)
			valid = false
		}
	}
	return valid, nil
}
