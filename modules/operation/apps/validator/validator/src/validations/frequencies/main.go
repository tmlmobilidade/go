package frequencies

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	frequencies_fields "main/validations/frequencies/fields/checks"
	frequencies_standard "main/validations/frequencies/standard/checks"
)

func init() { registry.RegisterWithTables("frequencies", RunValidations) }
func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "frequencies")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "frequencies", config.ProgressThresholdSmall)
	err = tables.ForEachRow("frequencies", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "frequencies.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		runner.Run(services.RuleActions{
			"frequencies_trip_id_field": func() {
				check("frequencies_trip_id_field", frequencies_fields.TripIdField(db, rules.Rule("frequencies_trip_id_field")))
			},
			"frequencies_exact_times_field": func() {
				check("frequencies_exact_times_field", frequencies_fields.ExactTimesField(db, rules.Rule("frequencies_exact_times_field")))
			},
			"frequencies_headway_secs_field": func() {
				check("frequencies_headway_secs_field", frequencies_fields.HeadwaySecsField(db, rules.Rule("frequencies_headway_secs_field")))
			},
			"frequencies_end_time_field": func() {
				check("frequencies_end_time_field", frequencies_fields.EndTimeField(db, rules.Rule("frequencies_end_time_field")))
			},
			"frequencies_start_time_field": func() {
				check("frequencies_start_time_field", frequencies_fields.StartTimeField(db, rules.Rule("frequencies_start_time_field")))
			},
			"frequencies_trip_id_references_trips_table": func() {
				check("frequencies_trip_id_references_trips_table", frequencies_standard.TripIdValid(db, rules.Rule("frequencies_trip_id_references_trips_table")))
			},
			"frequencies_exact_times_zero_when_timed_trip_uses_frequencies": func() {
				check("frequencies_exact_times_zero_when_timed_trip_uses_frequencies", frequencies_standard.ExactTimesValid(db, rules.Rule("frequencies_exact_times_zero_when_timed_trip_uses_frequencies")))
			},
			"frequencies_headway_secs_positive_and_aligns_trip": func() {
				check("frequencies_headway_secs_positive_and_aligns_trip", frequencies_standard.HeadwaySecsValid(db, rules.Rule("frequencies_headway_secs_positive_and_aligns_trip")))
			},
			"frequency_end_time_valid": func() {
				check("frequency_end_time_valid", frequencies_standard.EndTimeValid(db, rules.Rule("frequency_end_time_valid")))
			},
			"frequency_start_time_valid": func() {
				check("frequency_start_time_valid", frequencies_standard.StartTimeValid(db, rules.Rule("frequency_start_time_valid")))
			},
		}, nil)
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating frequencies: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed frequencies.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
