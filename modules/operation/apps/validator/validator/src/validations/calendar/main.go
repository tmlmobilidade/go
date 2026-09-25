package calendar

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/calendar/validations"
)

func init() {
	registry.Register("calendar", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.CalendarRules
	if rules != nil {
		section = &rules.Calendar
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
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
		runner.Run(services.RuleActions{
			"calendar_service_id_unique_non_empty": func() { validations.ServiceIdValidation(&calendar, i, &gtfs) },
			"calendar_start_date_valid_yyyymmdd":   func() { validations.DateValidation(calendar.StartDate, "start_date", i) },
			"calendar_end_date_valid_yyyymmdd":     func() { validations.DateValidation(calendar.EndDate, "end_date", i) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendars: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
