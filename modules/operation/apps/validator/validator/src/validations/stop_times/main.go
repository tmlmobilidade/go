package stop_times

import (
	"fmt"
	"main/config"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	stopTimesTypes "main/types/stop_times"
	registry "main/validations"
	validations "main/validations/stop_times/validations"
	"strconv"
)

func init() {
	registry.Register("stop_times", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.StopTimesRules
	if rules != nil {
		section = &rules.StopTimes
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	groupStatuses := map[string]map[string]ruleset.Status{}
	lib.AppLogger.Debug("Running StopTimes Validations...")

	// Pre-load stop location_type cache for performance
	// This avoids repeated database queries in stop_id validation
	lib.AppLogger.Debug("Pre-loading stop location_type cache...")
	stopLocationTypeCache := make(map[string]string) // stop_id -> location_type
	err := gtfs.IterateStops(func(i int, rawStop types.StopRaw) error {
		if rawStop.StopId != "" {
			stopLocationTypeCache[rawStop.StopId] = rawStop.LocationType
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-loading stop location_type cache: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-loaded location_type for %d stops", len(stopLocationTypeCache)))

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "stop_times", config.ProgressThresholdLarge)

	// Pre-compute min/max stop sequences per trip_id for performance
	// This avoids N+1 queries in arrival_time validation
	tripStopSequences := make(map[string]types.TripStopSequence)
	tripStopTimes := make(map[string][]stopTimesTypes.TimeSequenceStop)

	var stopTimesRules *types.StopTimesRules
	if rules != nil {
		stopTimesRules = &rules.StopTimes
	}

	// Single iteration: combine pre-computation and validation
	err = gtfs.IterateStopTimes(func(i int, rawStopTime types.StopTimeRaw) error {
		tracker.Track()

		// Pre-compute trip stop sequences
		if rawStopTime.TripId != "" && rawStopTime.StopSequence != "" {
			tripId := rawStopTime.TripId
			stopSeq, err := strconv.Atoi(rawStopTime.StopSequence)
			if err == nil {
				if seq, exists := tripStopSequences[tripId]; exists {
					if stopSeq < seq.Min {
						seq.Min = stopSeq
					}
					if stopSeq > seq.Max {
						seq.Max = stopSeq
					}
					tripStopSequences[tripId] = seq
				} else {
					tripStopSequences[tripId] = types.TripStopSequence{Min: stopSeq, Max: stopSeq}
				}
			}
		}

		// Parse and validate stop time
		stopTime := validations.ParseStopTimes(rawStopTime, i)

		if stopTime == (types.StopTime{}) {
			return nil
		}

		if stopTime.TripId != nil && *stopTime.TripId != "" && stopTime.StopSequence != nil {
			tripStopTimes[*stopTime.TripId] = append(tripStopTimes[*stopTime.TripId], stopTimesTypes.TimeSequenceStop{
				Row:           i,
				StopSequence:  *stopTime.StopSequence,
				ArrivalTime:   stopTime.ArrivalTime,
				DepartureTime: stopTime.DepartureTime,
			})
		}

		// Validate trip_id (using IdMap cache - no database query)
		statuses := runner.Run(services.RuleActions{
			"stop_times_trip_id_references_trips_table":                  func() { validations.TripIdValidation(&stopTime, i, &gtfs) },
			"arrival_time_ordering_with_departure_and_frequencies":       func() { validations.ArrivalTimeValidation(&stopTime, i, &gtfs, stopTimesRules, tripStopSequences) },
			"departure_time_ordering_with_arrival_and_timepoint":         func() { validations.DepartureTimeValidation(&stopTime, i, &gtfs, stopTimesRules) },
			"stop_times_stop_id_references_stops_table":                  func() { validations.StopIdValidation(&stopTime, i, &gtfs, stopLocationTypeCache) },
			"location_group_id_consistent_with_trip_id_and_stops":        func() { validations.LocationGroupIdValidation(&stopTime, i, &gtfs) },
			"start_pickup_drop_off_window_valid":                         func() { validations.StartPickupDropOffWindowValidation(&stopTime, i, stopTimesRules) },
			"end_pickup_drop_off_window_valid":                           func() { validations.EndPickupDropOffWindowValidation(&stopTime, i, stopTimesRules) },
			"pickup_type_valid_gtfs_enum":                                func() { validations.PickupTypeValidation(&stopTime, i, stopTimesRules) },
			"stop_headsign_present":                                      func() { validations.StopHeadsignValidation(&stopTime, i, stopTimesRules) },
			"stop_times_continuous_drop_off_valid_gtfs_enum":             func() { validations.ContinuousDropOffValidation(&stopTime, i, stopTimesRules) },
			"stop_times_continuous_pickup_valid_gtfs_enum":               func() { validations.ContinuousPickupValidation(&stopTime, i, stopTimesRules) },
			"drop_off_type_valid_gtfs_enum":                              func() { validations.DropOffTypeValidation(&stopTime, i, stopTimesRules) },
			"stop_times_shape_dist_traveled_non_decreasing_on_trip":      func() { validations.ShapeDistTraveledValidation(&stopTime, i, stopTimesRules) },
			"timepoint_valid_gtfs_enum":                                  func() { validations.TimepointValidation(&stopTime, i, stopTimesRules) },
			"pickup_booking_rule_id_references_booking_rules":            func() { validations.PickupBookingRuleIdValidation(&stopTime, i, &gtfs, stopTimesRules) },
			"drop_off_booking_rule_id_references_booking_rules_or_empty": func() { validations.DropOffBookingRuleIdValidation(&stopTime, i, &gtfs, stopTimesRules) },
		}, nil)

		if stopTime.TripId != nil {
			groupStatuses[*stopTime.TripId] = services.MergeRuleStatuses(groupStatuses[*stopTime.TripId], statuses)
		}

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating stop times: %v", err))
	} else {
		// Need be run ArrivalDepartureTimeSequenceValidation here because it needs to be run after all rows are processed
		for tripID, times := range tripStopTimes {
			runner.Run(services.RuleActions{
				"arrival_departure_time_non_decreasing_by_stop_sequence": func() {
					validations.ArrivalDepartureTimeSequenceValidation(map[string][]stopTimesTypes.TimeSequenceStop{tripID: times}, stopTimesRules)
				},
			}, groupStatuses[tripID])
		}

		lib.AppLogger.Info(fmt.Sprintf("Completed stop_times.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
