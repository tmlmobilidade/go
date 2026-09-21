package calendar_dates

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	validations "main/validations/calendar_dates/validations"
	registry "main/validations"
)

func init() {
	registry.Register("calendar_dates", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Calendar Dates Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "calendar_dates", config.ProgressThresholdSmall)

	err := gtfs.IterateCalendarDates(func(i int, rawCalendarDate types.CalendarDatesRaw) error {
		tracker.Track()
		calendarDate := ParseCalendarDates(rawCalendarDate, i)

		if calendarDate == (types.CalendarDates{}) {
			return nil
		}

		var calendarDatesRules types.CalendarDatesRules
		if rules != nil {
			calendarDatesRules = rules.CalendarDates
		}

		// Validate service_id
		validations.ServiceIdValidation(&calendarDate, i)

		// Validate date
		validations.DateValidation(&calendarDate, i)

		// Validate exception_type
		validations.ExceptionTypeValidation(&calendarDate, i, &calendarDatesRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendar dates: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar_dates.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
