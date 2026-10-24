package stop_times

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	stop_times_fields "main/validations/stop_times/fields/checks"
	stop_times_standard "main/validations/stop_times/standard/checks"
)

func init() {
	registry.RegisterWithTables("stop_times", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, dagErr := services.NewRuleRunner(gtfs, rules, "stop_times")
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("stop_times")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	check := func(db *services.SQLiteContext, ruleID string, err error) {
		if err != nil {
			ctx := lib.NewValidationContext("N/A", "stop_times.txt", ruleID, db.Row, services.AppMessageService)
			ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
		}
	}
	lib.AppLogger.Debug("Running StopTimes Validations...")

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "stop_times", config.ProgressThresholdLarge)

	err = runner.RunTable(table, "trip", "trip_id", func(db *services.SQLiteContext) services.RuleActions {
		return services.RuleActions{
			//
			// Fields
			"stop_times_arrival_time_field": func() {
				check(db, "stop_times_arrival_time_field", stop_times_fields.ArrivalTimeField(db, rules.Rule("stop_times_arrival_time_field")))
			},
			"stop_times_continuous_drop_off_field": func() {
				check(db, "stop_times_continuous_drop_off_field", stop_times_fields.ContinuousDropOffField(db, rules.Rule("stop_times_continuous_drop_off_field")))
			},
			"stop_times_continuous_pickup_field": func() {
				check(db, "stop_times_continuous_pickup_field", stop_times_fields.ContinuousPickupField(db, rules.Rule("stop_times_continuous_pickup_field")))
			},
			"stop_times_departure_time_field": func() {
				check(db, "stop_times_departure_time_field", stop_times_fields.DepartureTimeField(db, rules.Rule("stop_times_departure_time_field")))
			},
			"stop_times_drop_off_booking_rule_id_field": func() {
				check(db, "stop_times_drop_off_booking_rule_id_field", stop_times_fields.DropOffBookingRuleIdField(db, rules.Rule("stop_times_drop_off_booking_rule_id_field")))
			},
			"stop_times_drop_off_type_field": func() {
				check(db, "stop_times_drop_off_type_field", stop_times_fields.DropOffTypeField(db, rules.Rule("stop_times_drop_off_type_field")))
			},
			"stop_times_end_pickup_drop_off_window_field": func() {
				check(db, "stop_times_end_pickup_drop_off_window_field", stop_times_fields.EndPickupDropOffWindowField(db, rules.Rule("stop_times_end_pickup_drop_off_window_field")))
			},
			"stop_times_location_group_id_field": func() {
				check(db, "stop_times_location_group_id_field", stop_times_fields.LocationGroupIdField(db, rules.Rule("stop_times_location_group_id_field")))
			},
			"stop_times_pickup_booking_rule_id_field": func() {
				check(db, "stop_times_pickup_booking_rule_id_field", stop_times_fields.PickupBookingRuleIdField(db, rules.Rule("stop_times_pickup_booking_rule_id_field")))
			},
			"stop_times_pickup_type_field": func() {
				check(db, "stop_times_pickup_type_field", stop_times_fields.PickupTypeField(db, rules.Rule("stop_times_pickup_type_field")))
			},
			"stop_times_shape_dist_traveled_field": func() {
				check(db, "stop_times_shape_dist_traveled_field", stop_times_fields.ShapeDistTraveledField(db, rules.Rule("stop_times_shape_dist_traveled_field")))
			},
			"stop_times_start_pickup_drop_off_window_field": func() {
				check(db, "stop_times_start_pickup_drop_off_window_field", stop_times_fields.StartPickupDropOffWindowField(db, rules.Rule("stop_times_start_pickup_drop_off_window_field")))
			},
			"stop_times_stop_headsign_field": func() {
				check(db, "stop_times_stop_headsign_field", stop_times_fields.StopHeadsignField(db, rules.Rule("stop_times_stop_headsign_field")))
			},
			"stop_times_stop_id_field": func() {
				check(db, "stop_times_stop_id_field", stop_times_fields.StopIdField(db, rules.Rule("stop_times_stop_id_field")))
			},
			"stop_times_timepoint_field": func() {
				check(db, "stop_times_timepoint_field", stop_times_fields.TimepointField(db, rules.Rule("stop_times_timepoint_field")))
			},
			"stop_times_trip_id_field": func() {
				check(db, "stop_times_trip_id_field", stop_times_fields.TripIdField(db, rules.Rule("stop_times_trip_id_field")))
			},

			//
			// Standard
			"stop_times_arrival_departure_time_sequence": func() {
				check(db, "stop_times_arrival_departure_time_sequence", stop_times_standard.ArrivalDepartureTimeSequence(db, rules.Rule("stop_times_arrival_departure_time_sequence")))
			},
			"stop_times_arrival_time_valid": func() {
				check(db, "stop_times_arrival_time_valid", stop_times_standard.ArrivalTimeValid(db, rules.Rule("stop_times_arrival_time_valid")))
			},
			"stop_times_continuous_drop_off_valid_gtfs_enum": func() {
				check(db, "stop_times_continuous_drop_off_valid_gtfs_enum", stop_times_standard.ContinuousDropOffValid(db, rules.Rule("stop_times_continuous_drop_off_valid_gtfs_enum")))
			},
			"stop_times_continuous_pickup_valid_gtfs_enum": func() {
				check(db, "stop_times_continuous_pickup_valid_gtfs_enum", stop_times_standard.ContinuousPickupValid(db, rules.Rule("stop_times_continuous_pickup_valid_gtfs_enum")))
			},
			"stop_times_departure_time_valid": func() {
				check(db, "stop_times_departure_time_valid", stop_times_standard.DepartureTimeValid(db, rules.Rule("stop_times_departure_time_valid")))
			},
			"stop_times_drop_off_booking_rule_id_foreign": func() {
				check(db, "stop_times_drop_off_booking_rule_id_foreign", stop_times_standard.DropOffBookingRuleIdForeign(db, rules.Rule("stop_times_drop_off_booking_rule_id_foreign")))
			},
			"stop_times_drop_off_type_valid": func() {
				check(db, "stop_times_drop_off_type_valid", stop_times_standard.DropOffTypeValid(db, rules.Rule("stop_times_drop_off_type_valid")))
			},
			"stop_times_end_pickup_drop_off_window_valid": func() {
				check(db, "stop_times_end_pickup_drop_off_window_valid", stop_times_standard.EndPickupDropOffWindowValid(db, rules.Rule("stop_times_end_pickup_drop_off_window_valid")))
			},
			"stop_times_location_group_id_forbidden": func() {
				check(db, "stop_times_location_group_id_forbidden", stop_times_standard.LocationGroupIdForbidden(db, rules.Rule("stop_times_location_group_id_forbidden")))
			},
			"stop_times_pickup_booking_rule_id_foreign": func() {
				check(db, "stop_times_pickup_booking_rule_id_foreign", stop_times_standard.PickupBookingRuleIdForeign(db, rules.Rule("stop_times_pickup_booking_rule_id_foreign")))
			},
			"stop_times_pickup_type_valid": func() {
				check(db, "stop_times_pickup_type_valid", stop_times_standard.PickupTypeValid(db, rules.Rule("stop_times_pickup_type_valid")))
			},
			"stop_times_shape_dist_traveled_valid": func() {
				check(db, "stop_times_shape_dist_traveled_valid", stop_times_standard.ShapeDistTraveledValid(db, rules.Rule("stop_times_shape_dist_traveled_valid")))
			},
			"stop_times_start_pickup_drop_off_window_valid": func() {
				check(db, "stop_times_start_pickup_drop_off_window_valid", stop_times_standard.StartPickupDropOffWindowValid(db, rules.Rule("stop_times_start_pickup_drop_off_window_valid")))
			},
			"stop_times_stop_id_foreign": func() {
				check(db, "stop_times_stop_id_foreign", stop_times_standard.StopIdForeign(db, rules.Rule("stop_times_stop_id_foreign")))
			},
			"stop_times_timepoint_valid": func() {
				check(db, "stop_times_timepoint_valid", stop_times_standard.TimepointValid(db, rules.Rule("stop_times_timepoint_valid")))
			},
			"stop_times_trip_id_foreign": func() {
				check(db, "stop_times_trip_id_foreign", stop_times_standard.TripIdForeign(db, rules.Rule("stop_times_trip_id_foreign")))
			},
		}
	}, tracker.Track)

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating stop_times: %v", err))
		return
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed stop_times.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
