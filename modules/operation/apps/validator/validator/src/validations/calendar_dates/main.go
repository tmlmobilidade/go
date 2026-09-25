package calendar_dates

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/calendar_dates/validations"
)

func init() {
	registry.Register("calendar_dates", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.CalendarDatesRules
	if rules != nil {
		section = &rules.CalendarDates
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
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
		runner.Run(services.RuleActions{
			"calendar_dates_service_id_references_calendar":       func() { validations.ServiceIdValidation(&calendarDate, i) },
			"calendar_dates_exception_date_valid_yyyymmdd":        func() { validations.DateValidation(&calendarDate, i) },
			"calendar_dates_exception_type_add_or_remove_service": func() { validations.ExceptionTypeValidation(&calendarDate, i, &calendarDatesRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating calendar dates: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed calendar_dates.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
