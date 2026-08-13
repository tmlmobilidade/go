package calendar

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	validations "main/validations/calendar/validations"
	registry "main/validations"
)

func init() {
	registry.Register("calendar", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	lib.AppLogger.Debug("Running Calendar Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "calendar", config.ProgressThresholdSmall)

	err := gtfs.IterateCalendars(func(i int, rawCalendar types.CalendarRaw) error {
		tracker.Track()
		calendar := ParseCalendar(rawCalendar, i, &gtfs)

		if calendar == (types.Calendar{}) {
			return nil
		}

		// Validate service_id
		validations.ServiceIdValidation(&calendar, i, &gtfs)

		// Validate service dates
		validations.DateValidation(calendar.StartDate, "start_date", i)
		validations.DateValidation(calendar.EndDate, "end_date", i)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendars: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
